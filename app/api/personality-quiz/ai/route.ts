import { NextResponse } from 'next/server';
import OpenAI from 'openai';
import type { ChatCompletionMessageParam } from 'openai/resources/chat/completions';
import drinksData from '@/app/api/drinks.json';

type QuizAnswer = {
  statement: string;
  score: number; // 0-100 agree score
};

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const answers: QuizAnswer[] = Array.isArray(body?.answers)
      ? body.answers
      : [];
    const constraints = body?.constraints ?? {
      dairy: 'flex',
      caffeine: 'any',
      allergens: [] as string[],
    };

    if (!answers.length) {
      return NextResponse.json(
        { error: 'answers[] is required' },
        { status: 400 }
      );
    }

    const apiKey =
      process.env.OPENAI_API_KEY || process.env.NEXT_PUBLIC_OPENAI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: 'Missing OPENAI_API_KEY in environment' },
        { status: 500 }
      );
    }

    // Build compact menu to keep tokens bounded
    const menu = (drinksData as any)?.menu ?? {};
    const compactMenu = Object.values(menu).map((item: any) => ({
      id: item.id,
      name: item.name,
      category: item.category,
      description: item.description,
      tags: item.tags,
    }));

    const systemPrompt = `You are an expert boba tea guide for Angel Tea. You select 1-3 menu items and explain why they fit the user based on their responses. You must:
 - Use ONLY items from the provided menu.
 - Respect user constraints: dairy, caffeine, allergens.
 - Keep explanations clear and specific to the item's flavor, texture, vibe.
 - Include suggested sweetness (0-100), ice (0-100), milk (dairy|non_dairy|none), caffeine (none|standard_tea|strong), and an optional topping from provided notes where it fits.
 - Return strict JSON.
 some top sellers users order, Mango pomelo 
Sparking kiwi/orange
Mango yogurt smoothie
Passionfruit smoothie  
Herbal health teas series
`;

    const userPrompt = {
      menu: compactMenu,
      constraints,
      answers,
      notes: (drinksData as any)?.notes ?? {},
      output_schema: {
        recommendations: [
          {
            id: 'string',
            display_name: 'string',
            params: {
              sweetness_pct: 0,
              ice_pct: 0,
              milk: 'dairy|non_dairy|none',
              caffeine: 'none|standard_tea|strong',
              toppings: ['optional topping id'],
            },
            why: ['short reason strings'],
          },
        ],
      },
    };

    const messages: ChatCompletionMessageParam[] = [
      { role: 'system', content: systemPrompt },
      {
        role: 'user',
        content: `Use this menu and answers to recommend 1-3 items. Return ONLY JSON matching output_schema.\n\nDATA:\n${JSON.stringify(
          userPrompt
        )}`,
      },
    ];

    const openai = new OpenAI({ apiKey });
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      temperature: 0.4,
      messages,
      max_tokens: 600,
    });

    const content = completion.choices?.[0]?.message?.content || '{}';
    // Try parse JSON; if the model wrapped in markdown, strip code fences
    const jsonText = content.replace(/^```(?:json)?\n|\n```$/g, '');
    let parsed: any = {};
    try {
      parsed = JSON.parse(jsonText);
    } catch {
      parsed = { raw: content };
    }

    return NextResponse.json({
      recommendations: parsed?.recommendations ?? [],
      raw: parsed,
      usage: completion.usage,
    });
  } catch (e: any) {
    return NextResponse.json(
      { error: e?.message ?? 'Bad Request' },
      { status: 400 }
    );
  }
}
