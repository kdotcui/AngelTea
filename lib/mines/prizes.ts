import { MinesPrize } from '@/types/mines';

// Multiplier-based prizes for Mines game
// Higher multipliers = Better prizes
export const MINES_PRIZES: MinesPrize[] = [
  {
    id: 'mines_free_drink',
    type: 'free_drink',
    label: 'Free Drink',
    value: 'drink',
    multiplier: 3.0, // Need 3x or higher
  },
  {
    id: 'mines_discount_20',
    type: 'discount_20',
    label: '20% Off',
    value: '20',
    multiplier: 2.5, // Need 2.5x or higher
  },
  {
    id: 'mines_discount_15',
    type: 'discount_15',
    label: '15% Off',
    value: '15',
    multiplier: 2.0, // Need 2.0x or higher
  },
  {
    id: 'mines_discount_10',
    type: 'discount_10',
    label: '10% Off',
    value: '10',
    multiplier: 1.5, // Need 1.5x or higher
  },
  {
    id: 'mines_discount_5',
    type: 'discount_5',
    label: '5% Off',
    value: '5',
    multiplier: 1.2, // Need 1.2x or higher
  },
];

export const DAILY_PLAYS_LIMIT = 2;

// Calculate multiplier based on revealed tiles and mines
export function calculateMultiplier(revealedCount: number, minesCount: number): number {
  const totalTiles = 25;
  const safeTiles = totalTiles - minesCount;
  
  if (revealedCount === 0) return 1.0;
  
  // Slower multiplier growth - more tiles needed for higher multipliers
  // Formula: 1 + (revealedCount / safeTiles) ^ 1.8 * minesFactor
  const progress = revealedCount / safeTiles;
  const exponentialGrowth = Math.pow(progress, 1.8); // Power > 1 = slower start, faster end
  
  // Mines factor is less aggressive now
  const minesFactor = 1 + (minesCount / totalTiles) * 0.5;
  
  const multiplier = 1 + (exponentialGrowth * 2 * minesFactor);
  
  return Math.round(multiplier * 100) / 100;
}

// Get prize based on final multiplier
export function getPrizeForMultiplier(multiplier: number): MinesPrize | null {
  // Sort prizes by multiplier descending
  const sortedPrizes = [...MINES_PRIZES].sort((a, b) => b.multiplier - a.multiplier);
  
  // Find the best prize the player qualifies for
  for (const prize of sortedPrizes) {
    if (multiplier >= prize.multiplier) {
      return prize;
    }
  }
  
  return null; // No prize if multiplier too low
}

// Prize code generation removed - prizes are tracked by phone number only

export function getPrizeExpiryDate(): number {
  const now = new Date();
  const expiry = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000); // 30 days
  return expiry.getTime();
}

