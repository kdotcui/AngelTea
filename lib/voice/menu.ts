export type Size = 'm' | 'l';

export type MenuItem = {
  category: string;
  prices: Record<Size, number>;
  topseller?: boolean;
  included_toppings?: string[];
};

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
] as const;

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

export const VALID_SUGAR = new Set(['0%', '25%', '50%', '75%', '100%']);
export const VALID_ICE = new Set(['no ice', 'less ice', 'regular ice', 'extra ice']);

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

  // ---------------- SAGO NECTAR (Caffeine Free) ----------------
  'Mango Pomelo Sago Nectar': {
    category: 'sago_nectar',
    prices: { m: 7.59, l: 8.49 },
    topseller: true,
  },
  'Strawberry Sago Nectar': {
    category: 'sago_nectar',
    prices: { m: 7.59, l: 8.49 },
    topseller: true,
  },
  'Pina Colada Sago Nectar': { category: 'sago_nectar', prices: { m: 7.59, l: 8.49 } },
  'Peach Sago Nectar': { category: 'sago_nectar', prices: { m: 7.59, l: 8.49 } },
  'Lychee Bayberry Sago Nectar': { category: 'sago_nectar', prices: { m: 7.59, l: 8.49 } },

  // ---------------- SPARKLING (Caffeine Free, flavor variants) ----------------
  'Sparkling Strawberry': { category: 'sparkling', prices: { m: 7.39, l: 8.29 }, topseller: true },
  'Sparkling Pineapple': { category: 'sparkling', prices: { m: 7.39, l: 8.29 }, topseller: true },
  'Sparkling Mango': { category: 'sparkling', prices: { m: 7.39, l: 8.29 } },
  'Sparkling Kiwi': { category: 'sparkling', prices: { m: 7.39, l: 8.29 } },
  'Sparkling Passion Fruit': { category: 'sparkling', prices: { m: 7.39, l: 8.29 } },
  'Sparkling Peach': { category: 'sparkling', prices: { m: 7.39, l: 8.29 } },
  'Sparkling Bayberry': { category: 'sparkling', prices: { m: 7.39, l: 8.29 } },
  'Sparkling Orange': { category: 'sparkling', prices: { m: 7.39, l: 8.29 } },

  // ---------------- YOGURT SMOOTHIE (Caffeine Free, flavor variants) ----------------
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

  // ---------------- MILK SLUSH (Caffeine Free, flavor variants) ----------------
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

export function normalizeName(name: string) {
  return (name || '').trim().toLowerCase();
}

export function canonTopping(name: string | undefined | null) {
  if (!name) return null;
  let n = normalizeName(name);
  if (!n) return null;
  if (TOPPING_SYNONYMS[n]) n = TOPPING_SYNONYMS[n];
  for (const t of TOPPINGS) {
    const tn = normalizeName(t);
    if (n === tn || tn.includes(n) || n.includes(tn)) {
      return t;
    }
  }
  return null;
}

export function findMenuItem(name: string) {
  const key = normalizeName(name);
  if (!key) return null;
  for (const item of Object.keys(MENU)) {
    if (normalizeName(item) === key) return item;
  }
  for (const item of Object.keys(MENU)) {
    if (normalizeName(item).includes(key)) return item;
  }
  return null;
}
