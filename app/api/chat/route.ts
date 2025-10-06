import OpenAI from 'openai';
import type { ChatCompletionMessageParam } from 'openai/resources/chat/completions';

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const {
      messages,
      model = 'gpt-4o-mini',
      temperature = 0.7,
      max_tokens,
    }: {
      messages?: ChatCompletionMessageParam[];
      model?: string;
      temperature?: number;
      max_tokens?: number;
    } = body || {};

    const apiKey =
      process.env.OPENAI_API_KEY || process.env.NEXT_PUBLIC_OPENAI_API_KEY;
    if (!apiKey) {
      return Response.json(
        {
          error:
            'Missing OPENAI_API_KEY. Add it to your .env.local (do not expose publicly).',
        },
        { status: 500 }
      );
    }

    if (!Array.isArray(messages) || messages.length === 0) {
      return Response.json(
        { error: "Invalid request: 'messages' must be a non-empty array." },
        { status: 400 }
      );
    }

    const openai = new OpenAI({ apiKey });

    const completion = await openai.chat.completions.create({
      model,
      messages,
      temperature,
      max_tokens,
    });

    const choice = completion.choices?.[0]?.message;
    return Response.json(
      {
        message: choice,
        usage: completion.usage,
        id: completion.id,
        model: completion.model,
        created: completion.created,
      },
      { status: 200 }
    );
  } catch (error: unknown) {
    const message =
      typeof error === 'object' && error && 'message' in error
        ? String((error as any).message)
        : 'Unexpected error';
    return Response.json({ error: message }, { status: 500 });
  }
}
