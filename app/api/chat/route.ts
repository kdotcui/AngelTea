import OpenAI from 'openai';
import type { ChatCompletionMessageParam } from 'openai/resources/chat/completions';
import {
  checkRateLimit,
  getSessionId,
  createRateLimitResponse,
  addRateLimitHeaders,
  RATE_LIMITS,
} from '@/lib/rateLimit';

export async function POST(request: Request) {
  try {
    // Check rate limit
    const sessionId = getSessionId(request);
    const rateLimitResult = checkRateLimit(sessionId, RATE_LIMITS.CHAT);
    
    if (!rateLimitResult.allowed) {
      return createRateLimitResponse(rateLimitResult);
    }
    const body = await request.json().catch(() => ({}));
    const {
      messages,
      model = 'gpt-5-nano',
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
    const response = Response.json(
      {
        message: choice,
        usage: completion.usage,
        id: completion.id,
        model: completion.model,
        created: completion.created,
      },
      { status: 200 }
    );

    // Add rate limit headers to successful response
    return addRateLimitHeaders(response, rateLimitResult);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unexpected error';
    return Response.json({ error: message }, { status: 500 });
  }
}
