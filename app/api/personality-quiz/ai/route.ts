import { NextResponse } from 'next/server';
import OpenAI from 'openai';
import type { ChatCompletionMessageParam } from 'openai/resources/chat/completions';
import drinksData from '@/app/api/drinks.json';
import {
  checkRateLimit,
  getSessionId,
  createRateLimitResponse,
  addRateLimitHeaders,
  RATE_LIMITS,
} from '@/lib/rateLimit';

type QuizAnswer = {
  situation: string;
  response: string;
  responseIndex: number;
};

type Constraints = {
  dairy: 'flex' | 'avoid' | 'ok';
  caffeine: 'any' | 'low' | 'avoid';
  allergens: string[];
};

type DrinkPersonality = {
  drinkName: string;
  personalityAnalysis: string;
  drinkMatch: string;
  vibes: string[];
};

type DrinkParams = {
  sweetness_pct?: number;
  ice_pct?: number;
  milk?: 'dairy' | 'non_dairy' | 'none';
  caffeine?: 'none' | 'standard_tea' | 'strong';
  toppings?: string[];
};

type DrinkRecommendation = {
  id: string;
  display_name: string;
  params: DrinkParams;
  why: string[];
};

type ParsedResult = {
  drinkPersonality?: DrinkPersonality;
  recommendations?: DrinkRecommendation[];
  raw?: string;
};

type MenuItem = {
  id: string;
  name: string;
  category: string;
  description: string;
  tags?: Record<string, boolean>;
};

export async function POST(req: Request) {
  try {
    // Check rate limit
    const sessionId = getSessionId(req);
    const rateLimitResult = checkRateLimit(sessionId, RATE_LIMITS.PERSONALITY_QUIZ_AI);
    
    if (!rateLimitResult.allowed) {
      return createRateLimitResponse(rateLimitResult);
    }

    const body = await req.json();
    const answers: QuizAnswer[] = Array.isArray(body?.answers)
      ? body.answers
      : [];
    const constraints: Constraints = body?.constraints ?? {
      dairy: 'flex',
      caffeine: 'any',
      allergens: [],
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
    const menu =
      'menu' in drinksData && typeof drinksData.menu === 'object'
        ? drinksData.menu
        : {};
    const compactMenu: MenuItem[] = Object.values(menu).map((item) => ({
      id: (item as MenuItem).id,
      name: (item as MenuItem).name,
      category: (item as MenuItem).category,
      description: (item as MenuItem).description,
      tags: (item as MenuItem).tags,
    }));

    const simpleToppings = drinksData.toppings.items.map((item) => item.name);

    const systemPrompt = `You are an expert boba tea personality matcher for Angel Tea. Based on situational quiz responses, you create a fun "You are a [DRINK NAME]!" result and recommend 1-3 drinks that match.

IMPORTANT: The quiz presents situations with 2 response options (indexed 0-1). Each choice reveals personality traits. Analyze the pattern of choices to understand the user's personality - look for themes across their responses.

DRINK CATEGORIES CONTEXT:
- Mango Pomelo Sago Nectar: Traditional Taiwanese dessert drink with sago (clear mini tapioca), mango & grapefruit pieces, ice-blended, topped with coconut milk for creaminess
- Milk Slush: Milk-based ice-blended slushie, richer than water-based. Oreo is most popular. Best with fruit popping boba. Popular with kids.
- Yogurt Smoothies: Yogurt-based ice-blended with fruit, even creamier than milk slush, thick texture. For yogurt lovers.
- Sparkling Series: Very refreshing, lemonade-esque soda/seltzer with coconut jelly for crunchy chewy texture. Best for hot weather.
- Herbal Health Teas: Traditional Chinese herbs brewed hot or iced, each with different health benefits. Available as take-home tea bags.
- Milk Teas: Classic options with different tea bases. Angel Milk Tea uses Assam black tea base.

TOP SELLERS: Mango Pomelo, Sparkling Kiwi/Orange, Mango Yogurt Smoothie, Passionfruit Smoothie, Herbal Health Teas series

dont just recommend top sells (Mango Pomelo) unless they are a explicit match for the personality.

TASK:
1. Analyze personality from situational responses - look for patterns in how they approach life
2. Pick ONE specific drink from menu as their personality: "You are a [DRINK NAME]!"
3. For drinkPersonality:
   - personalityAnalysis: Key trait/characteristic observed from their choices
   - drinkMatch: Why this drink embodies that personality (fun, playful, creative)
   - vibes: 2-3 words describing both them and the drink
4. Recommend 1-3 drinks (starting with the personality drink) that match
5. Respect constraints: dairy, caffeine, allergens
6. Suggest complementary toppings when they would enhance the drink ${simpleToppings.join(
      ', '
    )}
7. For EACH recommendation "why" array, provide EXACTLY 2 strings:
   - First string: A personality characteristic observed from their situational responses
   - Second string: Why this specific drink perfectly matches that characteristic
8. Return ONLY valid JSON matching the schema`;

    const userPrompt = {
      menu: compactMenu,
      constraints,
      answers,
      output_schema: {
        drinkPersonality: {
          drinkName: 'Exact drink name from menu',
          personalityAnalysis:
            'Key personality trait/characteristic from quiz answers',
          drinkMatch:
            'Why this specific drink embodies that personality (fun, playful, creative)',
          vibes: ['vibe 1', 'vibe 2', 'vibe 3'],
        },
        recommendations: [
          {
            id: 'drink_id',
            display_name: 'Drink Name',
            params: {
              toppings: ['Boba', 'Coconut Jelly'],
            },
            why: [
              'Personality characteristic from quiz (e.g., "You thrive on spontaneity and new experiences")',
              'Why this drink matches (e.g., "This refreshing sparkling drink brings that same adventurous energy with every fizzy sip")',
            ],
          },
        ],
      },
    };

    const messages: ChatCompletionMessageParam[] = [
      { role: 'system', content: systemPrompt },
      {
        role: 'user',
        content: `Analyze this personality quiz and create a fun "You are..." result with 1-3 drink recommendations. Return ONLY JSON.\n\nDATA:\n${JSON.stringify(
          userPrompt
        )}`,
      },
    ];

    const openai = new OpenAI({ apiKey });
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      temperature: 0.7,
      messages,
      max_tokens: 1000,
    });

    const content = completion.choices?.[0]?.message?.content || '{}';
    // Try parse JSON; if the model wrapped in markdown, strip code fences
    const jsonText = content.replace(/^```(?:json)?\n|\n```$/g, '');
    let parsed: ParsedResult = {};
    try {
      parsed = JSON.parse(jsonText) as ParsedResult;
    } catch {
      parsed = { raw: content };
    }

    const response = NextResponse.json({
      drinkPersonality: parsed?.drinkPersonality ?? null,
      recommendations: parsed?.recommendations ?? [],
      usage: completion.usage,
    });

    // Add rate limit headers to successful response
    return addRateLimitHeaders(response, rateLimitResult);
  } catch (e) {
    const errorMessage = e instanceof Error ? e.message : 'Bad Request';
    return NextResponse.json({ error: errorMessage }, { status: 400 });
  }
}
