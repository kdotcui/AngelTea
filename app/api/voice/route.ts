import OpenAI from 'openai';
import type { ChatCompletionMessageParam } from 'openai/resources/chat/completions';
import { VOICE_SYSTEM_PROMPT, buildTools, runToolByName } from '@/lib/voice/tools';

export const runtime = 'nodejs';

async function transcribeIfNeeded(openai: OpenAI, formData: FormData) {
  const text = formData.get('text');
  if (typeof text === 'string' && text.trim()) {
    return text.trim();
  }

  const audio = formData.get('audio');
  if (audio instanceof File) {
    const transcript = await openai.audio.transcriptions.create({
      model: 'gpt-4o-mini-transcribe',
      file: audio,
      response_format: 'text',
    });
    return transcript.trim();
  }

  throw new Error('No audio or text provided.');
}

async function runAgent(
  openai: OpenAI,
  userText: string
): Promise<{ reply: string; audioBase64: string }> {
  const messages: ChatCompletionMessageParam[] = [
    { role: 'system', content: VOICE_SYSTEM_PROMPT },
    { role: 'user', content: userText },
  ];

  const tools = buildTools();
  let finalReply = '';

  for (let round = 0; round < 3; round++) {
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      temperature: 0.4,
      messages,
      tools,
      tool_choice: 'auto',
    });

    const choice = completion.choices?.[0]?.message;
    if (!choice) break;

    if (choice.tool_calls && choice.tool_calls.length > 0) {
      messages.push(choice as ChatCompletionMessageParam);
      for (const call of choice.tool_calls) {
        let args: any = {};
        try {
          args = JSON.parse(call.function.arguments || '{}');
        } catch (error) {
          args = {};
        }
        const result = runToolByName(call.function.name, args);
        messages.push({
          role: 'tool',
          tool_call_id: call.id,
          content: JSON.stringify(result),
        });
      }
      continue;
    }

    if (typeof choice.content === 'string' && choice.content.trim()) {
      finalReply = choice.content.trim();
      break;
    }
  }

  if (!finalReply) {
    finalReply = 'Sorry, I could not process that. Please try again.';
  }

  const speech = await openai.audio.speech.create({
    model: 'gpt-4o-mini-tts',
    voice: 'alloy',
    input: finalReply,
  });
  const audioBuffer = Buffer.from(await speech.arrayBuffer());

  return {
    reply: finalReply,
    audioBase64: `data:audio/mp3;base64,${audioBuffer.toString('base64')}`,
  };
}

export async function POST(req: Request) {
  try {
    const apiKey = process.env.OPENAI_API_KEY || process.env.NEXT_PUBLIC_OPENAI_API_KEY;
    if (!apiKey) {
      return Response.json(
        { error: 'Voice agent disabled (no API key).' },
        { status: 503 }
      );
    }

    const openai = new OpenAI({ apiKey });
    const contentType = req.headers.get('content-type') || '';

    let userText: string | null = null;
    if (contentType.includes('form-data')) {
      const formData = await req.formData();
      userText = await transcribeIfNeeded(openai, formData);
    } else {
      const body = await req.json().catch(() => ({}));
      if (typeof body.text === 'string' && body.text.trim()) {
        userText = body.text.trim();
      }
    }

    if (!userText) {
      return Response.json({ error: 'No audio or text provided.' }, { status: 400 });
    }

    const { reply, audioBase64 } = await runAgent(openai, userText);

    return Response.json(
      {
        text: reply,
        audio: audioBase64,
        transcription: userText,
      },
      { status: 200 }
    );
  } catch (error: any) {
    const message = error?.message || 'Unexpected error';
    return Response.json({ error: message }, { status: 500 });
  }
}
