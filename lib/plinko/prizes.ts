import { Prize } from '@/types/plinko';

// Prize buckets arranged from LEFT to RIGHT (13 buckets total)
// EDGES = Hardest to hit (best rewards) | CENTER = Easiest to hit (no rewards)
export const PRIZES: Prize[] = [
  // Slot 0 - FAR LEFT (Rarest)
  {
    id: 'free_drink_left',
    type: 'free_drink',
    label: 'Free Drink',
    value: 'drink',
    color: '#ec4899',
    textColor: '#ffffff',
  },
  // Slot 1 - Left far outer
  {
    id: 'discount_20_left',
    type: 'discount_20',
    label: '20% Off',
    value: '20',
    color: '#f87171',
    textColor: '#ffffff',
  },
  // Slot 2 - Left outer
  {
    id: 'discount_15_left',
    type: 'discount_15',
    label: '15% Off',
    value: '15',
    color: '#34d399',
    textColor: '#064e3b',
  },
  // Slot 3 - Left mid-outer
  {
    id: 'discount_10_left',
    type: 'discount_10',
    label: '10% Off',
    value: '10',
    color: '#60a5fa',
    textColor: '#ffffff',
  },
  // Slot 4 - Left inner
  {
    id: 'discount_5_left',
    type: 'discount_5',
    label: '5% Off',
    value: '5',
    color: '#fbbf24',
    textColor: '#78350f',
  },
  // Slot 5 - CENTER LEFT (Common - NO PRIZE)
  {
    id: 'better_luck_left',
    type: 'better_luck',
    label: 'Better Luck',
    value: '0',
    color: '#94a3b8',
    textColor: '#ffffff',
  },
  // Slot 6 - CENTER (Most common - NO PRIZE)
  {
    id: 'better_luck_center',
    type: 'better_luck',
    label: 'Better Luck',
    value: '0',
    color: '#94a3b8',
    textColor: '#ffffff',
  },
  // Slot 7 - CENTER RIGHT (Common - NO PRIZE)
  {
    id: 'better_luck_right',
    type: 'better_luck',
    label: 'Better Luck',
    value: '0',
    color: '#94a3b8',
    textColor: '#ffffff',
  },
  // Slot 8 - Right inner
  {
    id: 'discount_5_right',
    type: 'discount_5',
    label: '5% Off',
    value: '5',
    color: '#fbbf24',
    textColor: '#78350f',
  },
  // Slot 9 - Right mid-outer
  {
    id: 'discount_10_right',
    type: 'discount_10',
    label: '10% Off',
    value: '10',
    color: '#60a5fa',
    textColor: '#ffffff',
  },
  // Slot 10 - Right outer
  {
    id: 'discount_15_right',
    type: 'discount_15',
    label: '15% Off',
    value: '15',
    color: '#34d399',
    textColor: '#064e3b',
  },
  // Slot 11 - Right far outer
  {
    id: 'discount_20_right',
    type: 'discount_20',
    label: '20% Off',
    value: '20',
    color: '#f87171',
    textColor: '#ffffff',
  },
  // Slot 12 - FAR RIGHT (Rarest)
  {
    id: 'free_drink_right',
    type: 'free_drink',
    label: 'Free Drink',
    value: 'drink',
    color: '#ec4899',
    textColor: '#ffffff',
  },
];

export const DAILY_PLAYS_LIMIT = 2;


export function getPrizeExpiryDate(): number {
  // Prize expires in 30 days
  return Date.now() + 30 * 24 * 60 * 60 * 1000;
}

