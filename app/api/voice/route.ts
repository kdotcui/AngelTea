import { NextResponse } from 'next/server';
import OpenAI from 'openai';
import type {
  ChatCompletionMessageParam,
  ChatCompletionTool,
} from 'openai/resources/chat/completions';

import {
  getMenu,
  priceForItem,
  placeOrder,
  type OrderItemInput,
} from '@/lib/voice/menu';

export const runtime = 'nodejs';

// Mirrors the Python demo behavior: short answers, confirmations, and strict menu/price use.
const SYSTEM_PROMPT = `You are a calm, helpful tea shop voice agent for Angel Tea.
Goals:
1) Recommend drinks briefly and clearly.
2) Answer prices accurately (sizes are M or L).
3) Place small orders (item, size M/L, sugar, ice, toppings, quantity), then read back the order and total price for confirmation.
4) If the user asks unclear questions, ask a short follow-up.

Rules:
- Keep answers short (1–3 sentences).
- Confirm key details when placing orders (item, size, sugar, ice, toppings, quantity).
- Use the provided tools:
  - get_menu(query)
  - get_price(name, size, toppings)
  - place_order(items[])
- Sizes are M or L. Each added topping is +$0.80 unless the drink lists included toppings.
- Never invent items or prices not in the tool results. If an item is not found, suggest close alternatives.`;

const tools: ChatCompletionTool[] = [
  {
    type: 'function',
    function: {
      name: 'get_menu',
      description: 'Return menu items; optionally filter by a query (name/category). Topsellers first.',
      parameters: {
        type: 'object',
        properties: {
          query: { type: 'string', description: 'Filter by keyword (optional).' },
        },
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'get_price',
      description: 'Return price for a specific drink and size (M or L). Includes topping charges if provided.',
      parameters: {
        type: 'object',
        properties: {
          name: { type: 'string', description: 'Drink name, e.g., Brown Sugar Bubble Tea.' },
          size: { type: 'string', description: 'M|L (required for accurate price).' },
          toppings: {
            type: 'array',
            items: { type: 'string' },
            description: 'Toppings to add (+$0.80 each).',
          },
        },
        required: ['name'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'place_order',
      description: 'Place a simple order. Returns normalized items, unit prices, line totals, and grand total.',
      parameters: {
        type: 'object',
        properties: {
          items: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                name: { type: 'string' },
                size: { type: 'string', description: 'M|L' },
                qty: { type: 'integer' },
                sugar: { type: 'string', description: '0%|25%|50%|75%|100%' },
                ice: { type: 'string', description: 'no/less/regular/extra ice' },
                toppings: {
                  type: 'array',
                  items: { type: 'string' },
                  description: 'Toppings to add (+$0.80 each).',
                },
              },
              required: ['name'],
            },
          },
        },
        required: ['items'],
      },
    },
  },
];

type HistoryMessage = ChatCompletionMessageParam;

const parseJSON = (value: string | null | undefined) => {
  if (!value) return undefined;
  try {
    return JSON.parse(value);
  } catch {
    return undefined;
  }
};

async function runAgent({
  text,
  history,
  client,
}: {
  text: string;
  history: HistoryMessage[];
  client: OpenAI;
}): Promise<string> {
  const baseMessages: ChatCompletionMessageParam[] = [
    { role: 'system', content: SYSTEM_PROMPT },
    ...history,
    { role: 'user', content: text },
  ];

  let response = await client.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: baseMessages,
    tools,
    tool_choice: 'auto',
  });

  let rounds = 0;
  const messages = [...baseMessages];

  while (true) {
    const choice = response.choices[0];
    const message = choice.message;
    const toolCalls = message.tool_calls || [];

    messages.push({
      role: 'assistant',
      content: message.content || '',
      tool_calls: toolCalls,
    });

    if (toolCalls.length === 0 || rounds >= 3) {
      const content = message.content?.trim() || 'I did not catch that—could you repeat?';
      return content;
    }

    rounds += 1;

    for (const tc of toolCalls) {
      const name = tc.function.name;
      const args = parseJSON(tc.function.arguments) || {};

      let result: unknown = { error: `unknown tool: ${name}` };
      try {
        if (name === 'get_menu') {
          result = { items: getMenu(args.query) };
        } else if (name === 'get_price') {
          result = {
            found: priceForItem(args.name, args.size, args.toppings) !== null,
            price: priceForItem(args.name, args.size, args.toppings),
            suggestion: null,
          };
        } else if (name === 'place_order') {
          result = placeOrder(Array.isArray(args.items) ? (args.items as OrderItemInput[]) : []);
        }
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Tool error';
        result = { error: message };
      }

      messages.push({
        role: 'tool',
        tool_call_id: tc.id,
        content: JSON.stringify(result),
      });
    }

    response = await client.chat.completions.create({
      model: 'gpt-4o-mini',
      messages,
      tools,
    });
  }
}

export async function POST(req: Request) {
  try {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: 'Missing OPENAI_API_KEY on server.' },
        { status: 500 }
      );
    }

    const contentType = req.headers.get('content-type') || '';
    if (!contentType.includes('multipart/form-data')) {
      return NextResponse.json(
        { error: "Use multipart/form-data with field 'audio'." },
        { status: 400 }
      );
    }

    const form = await req.formData();
    const audio = form.get('audio');
    const historyInput = parseJSON(form.get('history') as string);

    if (!(audio instanceof File)) {
      return NextResponse.json(
        { error: "Field 'audio' is required and must be a file." },
        { status: 400 }
      );
    }

    // Basic size guard: reject > 2MB (~10s at 16k mono)
    const maxBytes = 2 * 1024 * 1024;
    if (audio.size > maxBytes) {
      return NextResponse.json(
        { error: 'Audio too large; please keep each clip short (~10s max).' },
        { status: 413 }
      );
    }

    const client = new OpenAI({ apiKey });

    // Speech-to-text
    const transcript = await client.audio.transcriptions.create({
      model: 'gpt-4o-mini-transcribe',
      file: audio,
    });

    const userText = transcript.text?.trim();
    if (!userText) {
      return NextResponse.json(
        { error: 'Empty transcription. Please try again.' },
        { status: 400 }
      );
    }

    const history = Array.isArray(historyInput) ? (historyInput as HistoryMessage[]) : [];
    const replyText = await runAgent({ text: userText, history, client });

    // Text-to-speech
    const speech = await client.audio.speech.create({
      model: 'gpt-4o-mini-tts',
      voice: 'alloy',
      input: replyText,
    });

    const audioBuffer = Buffer.from(await speech.arrayBuffer());
    const audioBase64 = audioBuffer.toString('base64');

    return NextResponse.json({
      transcript: userText,
      replyText,
      audio: audioBase64,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unexpected error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
