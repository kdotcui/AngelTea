/**
 * Voice ordering domain logic ported from the Python demo.
 * Contains menu data, pricing rules, topping normalization, and order calculation.
 */

export type SizeKey = 'm' | 'l';
export type SizeInput = string | undefined | null;

export type SugarLevel = '0%' | '25%' | '50%' | '75%' | '100%';
export type IceLevel = 'no ice' | 'less ice' | 'regular ice' | 'extra ice';

export interface MenuItem {
  category: string;
  prices: Record<SizeKey, number>;
  topseller?: boolean;
  included_toppings?: string[];
}

export interface NormalizedItem {
  name: string;
  size: 'M' | 'L';
  qty: number;
  sugar: string;
  ice: string;
  toppings: string[];
  unit_price: number;
  line_total: number;
}

export interface OrderCalculation {
  items: NormalizedItem[];
  total: number;
}

export const TOPPING_PRICE = 0.8;

export const TOPPINGS = [
  'brown sugar boba',
  'coconut jelly',
  'herbal jelly',
  'sago',
  'oreo crumbs',
  'milk foam',
  'red bean',
  'chocolate',
  'mango popping bubbles',
  'green apple popping bubbles',
  'lychee popping bubbles',
  'blueberry popping bubbles',
  'strawberry popping bubbles',
];

export const TOPPING_SYNONYMS: Record<string, string> = {
  boba: 'brown sugar boba',
  tapioca: 'brown sugar boba',
  pearls: 'brown sugar boba',
  'milk cap': 'milk foam',
  'cheese foam': 'milk foam',
  oreo: 'oreo crumbs',
  'mango popping': 'mango popping bubbles',
  'green apple popping': 'green apple popping bubbles',
  'lychee popping': 'lychee popping bubbles',
  'blueberry popping': 'blueberry popping bubbles',
  'strawberry popping': 'strawberry popping bubbles',
};

const VALID_SUGAR: Set<string> = new Set(['0%', '25%', '50%', '75%', '100%']);
const VALID_ICE: Set<string> = new Set(['no ice', 'less ice', 'regular ice', 'extra ice']);

/**
  * Full Angel Tea menu with explicit M/L pricing.
  * Keys are display names; normalization is handled separately.
  */
export const MENU: Record<string, MenuItem> = {
  // ---------------- ANGEL MILK TEA ----------------
  'Angel Milk Tea': { category: 'milk_tea', prices: { m: 5.99, l: 6.89 }, topseller: true },
  'Jasmine Milk Tea': { category: 'milk_tea', prices: { m: 5.99, l: 6.89 } },
  'Coffee Milk Tea': { category: 'milk_tea', prices: { m: 6.59, l: 7.49 } },
  'Taro Milk Tea': { category: 'milk_tea', prices: { m: 6.29, l: 7.19 }, topseller: true },
  'Matcha Milk Tea': { category: 'milk_tea', prices: { m: 6.79, l: 7.69 } },
  'THAI Milk Tea': { category: 'milk_tea', prices: { m: 6.29, l: 7.19 } },
  'Oreo Milk Tea': { category: 'milk_tea', prices: { m: 6.59, l: 7.49 }, topseller: true },
  'Mango Milk Tea': { category: 'milk_tea', prices: { m: 6.29, l: 7.19 } },
  'Strawberry Milk Tea': { category: 'milk_tea', prices: { m: 6.29, l: 7.19 } },
  'Lychee Jasmine Milk Tea': { category: 'milk_tea', prices: { m: 6.29, l: 7.19 } },
  'Brown Sugar Bubble Tea': {
    category: 'milk_tea',
    prices: { m: 6.59, l: 7.49 },
    topseller: true,
    included_toppings: ['brown sugar boba'],
  },
  'Milk Foam Caramel Milk Tea': {
    category: 'milk_tea',
    prices: { m: 7.39, l: 8.29 },
    topseller: true,
    included_toppings: ['milk foam'],
  },

  // ---------------- ANGEL FRUIT TEA ----------------
  '3 Brother 4 Season Spring Tea': {
    category: 'fruit_tea',
    prices: { m: 7.39, l: 8.29 },
    topseller: true,
    included_toppings: ['brown sugar boba', 'sago', 'coconut jelly'],
  },
  'Mango Passion Green Tea': { category: 'fruit_tea', prices: { m: 6.75, l: 7.69 }, topseller: true },
  'Passion Fruit Green Tea': { category: 'fruit_tea', prices: { m: 6.25, l: 7.19 } },
  'Bayberry Jasmine Green Tea': { category: 'fruit_tea', prices: { m: 6.25, l: 7.19 } },
  'Pineapple Mango Green Tea': { category: 'fruit_tea', prices: { m: 6.75, l: 7.69 } },
  'Peach Coconut Green Tea': { category: 'fruit_tea', prices: { m: 6.75, l: 7.69 }, topseller: true },
  'Strawberry Pineapple Green Tea': { category: 'fruit_tea', prices: { m: 6.75, l: 7.69 }, topseller: true },
  'Milk Foam Honey Peach Black Tea': {
    category: 'fruit_tea',
    prices: { m: 7.39, l: 8.29 },
    included_toppings: ['milk foam'],
  },
  'Honey Lemon Black Tea': { category: 'fruit_tea', prices: { m: 6.49, l: 7.39 } },
  'Chinese Sour Plum Drink': { category: 'fruit_tea', prices: { m: 5.99, l: 6.89 } },

  // ---------------- LATTE SERIES ----------------
  'Strawberry Matcha Latte': {
    category: 'latte',
    prices: { m: 6.79, l: 7.69 },
    included_toppings: ['brown sugar boba', 'sago', 'coconut jelly'],
  },
  'Kiwi Matcha Latte': { category: 'latte', prices: { m: 6.79, l: 7.69 } },
  'Peach Matcha Latte': { category: 'latte', prices: { m: 6.79, l: 7.69 } },
  'Strawberry Ube Latte': {
    category: 'latte',
    prices: { m: 6.79, l: 7.69 },
    included_toppings: ['brown sugar boba', 'sago', 'coconut jelly'],
  },
  'Brown Sugar Bubble Latte': {
    category: 'latte',
    prices: { m: 6.59, l: 7.49 },
    included_toppings: ['brown sugar boba'],
  },

  // ---------------- SAGO NECTAR ----------------
  'Mango Pomelo Sago Nectar': { category: 'sago_nectar', prices: { m: 7.59, l: 8.49 }, topseller: true },
  'Strawberry Sago Nectar': { category: 'sago_nectar', prices: { m: 7.59, l: 8.49 }, topseller: true },
  'Pina Colada Sago Nectar': { category: 'sago_nectar', prices: { m: 7.59, l: 8.49 } },
  'Peach Sago Nectar': { category: 'sago_nectar', prices: { m: 7.59, l: 8.49 } },
  'Lychee Bayberry Sago Nectar': { category: 'sago_nectar', prices: { m: 7.59, l: 8.49 } },

  // ---------------- SPARKLING ----------------
  'Sparkling Strawberry': { category: 'sparkling', prices: { m: 7.39, l: 8.29 }, topseller: true },
  'Sparkling Pineapple': { category: 'sparkling', prices: { m: 7.39, l: 8.29 }, topseller: true },
  'Sparkling Mango': { category: 'sparkling', prices: { m: 7.39, l: 8.29 } },
  'Sparkling Kiwi': { category: 'sparkling', prices: { m: 7.39, l: 8.29 } },
  'Sparkling Passion Fruit': { category: 'sparkling', prices: { m: 7.39, l: 8.29 } },
  'Sparkling Peach': { category: 'sparkling', prices: { m: 7.39, l: 8.29 } },
  'Sparkling Bayberry': { category: 'sparkling', prices: { m: 7.39, l: 8.29 } },
  'Sparkling Orange': { category: 'sparkling', prices: { m: 7.39, l: 8.29 } },

  // ---------------- YOGURT SMOOTHIE ----------------
  'Mango Yogurt Smoothie': { category: 'yogurt_smoothie', prices: { m: 7.69, l: 8.59 } },
  'Strawberry Yogurt Smoothie': { category: 'yogurt_smoothie', prices: { m: 7.69, l: 8.59 } },
  'Passion Fruit Yogurt Smoothie': { category: 'yogurt_smoothie', prices: { m: 7.69, l: 8.59 } },
  'Lychee Yogurt Smoothie': { category: 'yogurt_smoothie', prices: { m: 7.69, l: 8.59 } },
  'Pineapple Yogurt Smoothie': { category: 'yogurt_smoothie', prices: { m: 7.69, l: 8.59 } },
  'Peach Yogurt Smoothie': { category: 'yogurt_smoothie', prices: { m: 7.69, l: 8.59 } },
  'Bayberry Yogurt Smoothie': { category: 'yogurt_smoothie', prices: { m: 7.69, l: 8.59 } },
  'Orange Yogurt Smoothie': { category: 'yogurt_smoothie', prices: { m: 7.69, l: 8.59 } },
  'Kiwi Yogurt Smoothie': { category: 'yogurt_smoothie', prices: { m: 7.69, l: 8.59 } },
  'Oreo Yogurt Smoothie': { category: 'yogurt_smoothie', prices: { m: 7.69, l: 8.59 } },

  // ---------------- HERBAL HEALTH TEA ----------------
  'Chrysanthemum Goji Berry Cassia Tea': { category: 'herbal', prices: { m: 5.99, l: 7.79 } },
  'Longan Rose Ginger Tea': { category: 'herbal', prices: { m: 5.99, l: 7.79 } },
  'Jasmine Date Goji Berry Rose Tea': { category: 'herbal', prices: { m: 5.99, l: 7.79 } },
  'Brown Sugar Date Ginger Tea': { category: 'herbal', prices: { m: 5.99, l: 7.79 } },
  'Ginseng Mulberry Chrysanthemum Goji Berry Tea': { category: 'herbal', prices: { m: 5.99, l: 7.79 } },

  // ---------------- MILK SLUSH ----------------
  'Mango Milk Slush': { category: 'milk_slush', prices: { m: 6.69, l: 7.89 } },
  'Passion Fruit Milk Slush': { category: 'milk_slush', prices: { m: 6.69, l: 7.89 } },
  'Strawberry Milk Slush': { category: 'milk_slush', prices: { m: 6.69, l: 7.89 } },
  'Lychee Milk Slush': { category: 'milk_slush', prices: { m: 6.69, l: 7.89 } },
  'Pineapple Milk Slush': { category: 'milk_slush', prices: { m: 6.69, l: 7.89 } },
  'Peach Milk Slush': { category: 'milk_slush', prices: { m: 6.69, l: 7.89 } },
  'Bayberry Milk Slush': { category: 'milk_slush', prices: { m: 6.69, l: 7.89 } },
  'Orange Milk Slush': { category: 'milk_slush', prices: { m: 6.69, l: 7.89 } },
  'Kiwi Milk Slush': { category: 'milk_slush', prices: { m: 6.69, l: 7.89 } },
  'Oreo Milk Slush': { category: 'milk_slush', prices: { m: 6.69, l: 7.89 } },
  'Matcha Milk Slush': { category: 'milk_slush', prices: { m: 6.69, l: 7.89 } },
  'Taro Milk Slush': { category: 'milk_slush', prices: { m: 6.69, l: 7.89 } },
};

const sizeMap: Record<string, SizeKey> = {
  m: 'm',
  medium: 'm',
  regular: 'm',
  s: 'm',
  small: 'm',
  l: 'l',
  large: 'l',
};

const normalize = (value: string | undefined | null): string => (value || '').trim().toLowerCase();

export const canonTopping = (name: string | undefined | null): string | null => {
  const normalized = normalize(name);
  if (!normalized) return null;
  const synonym = TOPPING_SYNONYMS[normalized];
  const candidate = synonym || normalized;

  for (const topping of TOPPINGS) {
    const lower = topping.toLowerCase();
    if (candidate === lower || candidate.includes(lower) || lower.includes(candidate)) {
      return topping;
    }
  }
  return null;
};

export const findMenuItem = (name: string | undefined | null): string | undefined => {
  const key = normalize(name);
  if (!key) return undefined;
  const entries = Object.keys(MENU);
  const exact = entries.find((item) => normalize(item) === key);
  if (exact) return exact;
  return entries.find((item) => normalize(item).includes(key));
};

export const priceForItem = (
  name: string | undefined | null,
  sizeInput?: SizeInput,
  toppings?: string[],
): number | null => {
  const menuKey = findMenuItem(name);
  if (!menuKey) return null;
  const info = MENU[menuKey];

  if (!sizeInput) return null;
  const sizeKey = sizeMap[normalize(sizeInput)];
  if (!sizeKey) return null;

  const base = info.prices[sizeKey];
  const included = new Set((info.included_toppings || []).map((t) => t.toLowerCase()));

  let extras = 0;
  for (const topping of toppings || []) {
    const canonical = canonTopping(topping);
    if (!canonical) continue;
    if (!included.has(canonical.toLowerCase())) {
      extras += 1;
    }
  }

  return Number((base + extras * TOPPING_PRICE).toFixed(2));
};

export const getMenu = (query?: string) => {
  const q = normalize(query);
  const items = Object.entries(MENU)
    .filter(([name, meta]) => !q || normalize(name).includes(q) || normalize(meta.category).includes(q))
    .map(([name, meta]) => ({
      name,
      category: meta.category,
      prices: meta.prices,
      topseller: meta.topseller ?? false,
      included_toppings: meta.included_toppings || [],
    }));

  items.sort((a, b) => {
    const topsellerRank = Number(Boolean(b.topseller)) - Number(Boolean(a.topseller));
    if (topsellerRank !== 0) return topsellerRank;
    if (a.category !== b.category) return a.category.localeCompare(b.category);
    return a.name.localeCompare(b.name);
  });

  return items;
};

export interface OrderItemInput {
  name?: string;
  size?: string;
  qty?: number;
  sugar?: string;
  ice?: string;
  toppings?: string[];
}

export interface PlaceOrderOk extends OrderCalculation {
  ok: true;
}

export interface PlaceOrderError {
  ok: false;
  error: string;
}

export const calculateOrder = (items: OrderItemInput[]): OrderCalculation | null => {
  let total = 0;
  const normalizedItems: NormalizedItem[] = [];

  for (const raw of items) {
    const name = (raw.name || '').trim();
    const sizeRaw = (raw.size || 'm').trim().toLowerCase();
    const qty = Number.isFinite(raw.qty) ? Number(raw.qty) : 1;
    const sugar = normalize(raw.sugar || '100%');
    const ice = normalize(raw.ice || 'regular ice');
    const toppings = raw.toppings || [];

    const validSugar = VALID_SUGAR.has(sugar) ? sugar : '100%';
    const validIce = VALID_ICE.has(ice) ? ice : 'regular ice';

    const unit = priceForItem(name, sizeRaw, toppings);
    if (unit === null) {
      return null;
    }

    const lineTotal = Number((unit * qty).toFixed(2));
    total += lineTotal;

    const canonicalToppings: string[] = [];
    for (const topping of toppings) {
      const canonical = canonTopping(topping);
      if (canonical) canonicalToppings.push(canonical);
    }

    normalizedItems.push({
      name: findMenuItem(name) || name,
      size: sizeMap[sizeRaw] === 'l' ? 'L' : 'M',
      qty,
      sugar: validSugar,
      ice: validIce,
      toppings: canonicalToppings,
      unit_price: unit,
      line_total: lineTotal,
    });
  }

  return {
    items: normalizedItems,
    total: Number(total.toFixed(2)),
  };
};

export const placeOrder = (items: OrderItemInput[]): PlaceOrderOk | PlaceOrderError => {
  const calc = calculateOrder(items);
  if (!calc) {
    return { ok: false, error: 'Item or size not found' };
  }
  return { ok: true, ...calc };
};
