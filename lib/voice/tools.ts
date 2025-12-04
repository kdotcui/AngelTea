import OpenAI from 'openai';
import { MENU, TOPPING_PRICE, canonTopping, findMenuItem, normalizeName, VALID_ICE, VALID_SUGAR } from './menu';
import type { MenuItem, Size } from './menu';

export type OrderItemInput = {
  name: string;
  size?: string;
  sugar?: string;
  ice?: string;
  toppings?: string[];
  quantity?: number;
};

export type OrderItem = {
  name: string;
  size: Size;
  sugar?: string;
  ice?: string;
  toppings: string[];
  quantity: number;
  linePrice: number;
};

export function listMenu(query?: string) {
  const q = normalizeName(query || '');
  const items = Object.entries(MENU)
    .filter(([name]) => !q || normalizeName(name).includes(q))
    .map(([name, item]) => ({
      name,
      category: item.category,
      topseller: !!item.topseller,
      prices: item.prices,
      included_toppings: item.included_toppings || [],
    }))
    .sort((a, b) => Number(b.topseller) - Number(a.topseller) || a.name.localeCompare(b.name));
  return items;
}

function normalizeSize(size?: string): Size | null {
  if (!size) return 'm';
  const n = normalizeName(size);
  if (n === 'm' || n === 'medium') return 'm';
  if (n === 'l' || n === 'large') return 'l';
  return null;
}

function normalizeToppings(raw?: string[]) {
  const out: string[] = [];
  for (const t of raw || []) {
    const c = canonTopping(t);
    if (c && !out.includes(c)) out.push(c);
  }
  return out;
}

function basePrice(item: MenuItem, size: Size) {
  return item.prices[size];
}

export function computePrice(name: string, size?: string, toppings?: string[]) {
  const resolvedName = findMenuItem(name);
  if (!resolvedName) {
    return { found: false as const, suggestion: null, price: null };
  }
  const item = MENU[resolvedName];
  const normSize = normalizeSize(size);
  if (!normSize) {
    return { found: false as const, suggestion: 'Please choose size M or L.', price: null };
  }
  const normalizedToppings = normalizeToppings(toppings);
  const included = new Set((item.included_toppings || []).map(normalizeName));
  const extras = normalizedToppings.filter((t) => !included.has(normalizeName(t)));
  const linePrice = basePrice(item, normSize) + extras.length * TOPPING_PRICE;
  return {
    found: true as const,
    name: resolvedName,
    size: normSize,
    price: Number(linePrice.toFixed(2)),
    extras: extras.length,
    toppings: normalizedToppings,
    included: Array.from(included),
  };
}

export function placeOrder(items: OrderItemInput[]) {
  const validated: OrderItem[] = [];
  for (const raw of items) {
    const resolvedName = findMenuItem(raw.name);
    if (!resolvedName) {
      return { ok: false as const, error: `Item not found: ${raw.name}`, items: [] };
    }
    const item = MENU[resolvedName];
    const size = normalizeSize(raw.size);
    if (!size) {
      return { ok: false as const, error: `Invalid size for ${resolvedName}. Choose M or L.`, items: [] };
    }
    const sugar = raw.sugar && VALID_SUGAR.has(normalizeName(raw.sugar)) ? raw.sugar : undefined;
    const ice = raw.ice && VALID_ICE.has(normalizeName(raw.ice)) ? raw.ice : undefined;
    const toppings = normalizeToppings(raw.toppings);
    const included = new Set((item.included_toppings || []).map(normalizeName));
    const extrasCount = toppings.filter((t) => !included.has(normalizeName(t))).length;
    const quantity = Math.max(1, Math.round(raw.quantity || 1));
    const unitPrice = basePrice(item, size) + extrasCount * TOPPING_PRICE;
    const linePrice = Number((unitPrice * quantity).toFixed(2));
    validated.push({
      name: resolvedName,
      size,
      sugar,
      ice,
      toppings,
      quantity,
      linePrice,
    });
  }

  const total = Number(
    validated.reduce((sum, item) => sum + item.linePrice, 0).toFixed(2)
  );

  return {
    ok: true as const,
    order_id: `AT-${Math.random().toString(36).slice(2, 8).toUpperCase()}`,
    items: validated,
    total,
  };
}

export const VOICE_SYSTEM_PROMPT = `
You are a calm, helpful Angel Tea voice agent.
Goals:
- Recommend drinks briefly.
- Answer prices accurately.
- Place orders with item, size (M/L), sugar, ice, toppings, and quantity; then read back the order and total for confirmation.

Rules:
- Keep answers short (1–3 sentences).
- If ordering, confirm item, size, sugar, ice, toppings, quantity, and total.
- Use tools: get_menu, get_price, place_order.
- Sizes are M or L. Extra toppings are +$0.80 unless included on the drink.
- Do not invent drinks or prices outside of tool results.
- If an item is not found, suggest close alternatives from the menu.
`.trim();

export function buildTools(): OpenAI.Chat.Completions.ChatCompletionTool[] {
  return [
    {
      type: 'function',
      function: {
        name: 'get_menu',
        description: 'Return menu items, optionally filtered by a search query.',
        parameters: {
          type: 'object',
          properties: {
            query: { type: 'string', description: 'Optional search text' },
          },
        },
      },
    },
    {
      type: 'function',
      function: {
        name: 'get_price',
        description: 'Get price for a drink with optional size and toppings.',
        parameters: {
          type: 'object',
          properties: {
            name: { type: 'string', description: 'Drink name' },
            size: { type: 'string', description: 'm or l' },
            toppings: {
              type: 'array',
              items: { type: 'string' },
              description: 'Optional toppings',
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
        description: 'Validate items and compute total with toppings.',
        parameters: {
          type: 'object',
          properties: {
            items: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  name: { type: 'string' },
                  size: { type: 'string', description: 'm or l' },
                  sugar: { type: 'string', description: '0%,25%,50%,75%,100%' },
                  ice: { type: 'string', description: 'no ice, less ice, regular ice, extra ice' },
                  toppings: { type: 'array', items: { type: 'string' } },
                  quantity: { type: 'number' },
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
}

export function runToolByName(name: string, args: any) {
  if (name === 'get_menu') {
    return listMenu(args?.query);
  }
  if (name === 'get_price') {
    return computePrice(args?.name, args?.size, args?.toppings);
  }
  if (name === 'place_order') {
    return placeOrder(Array.isArray(args?.items) ? args.items : []);
  }
  return { error: `Unknown tool: ${name}` };
}
