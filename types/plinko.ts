export type PrizeType = 
  | 'discount_5'
  | 'discount_10'
  | 'discount_15'
  | 'discount_20'
  | 'free_topping'
  | 'free_drink'
  | 'better_luck';

export interface Prize {
  id: string;
  type: PrizeType;
  label: string;
  value: string;
  color: string;
  textColor: string;
}

export interface PlinkoGameState {
  isPlaying: boolean;
  ballDropping: boolean;
  prize: Prize | null;
  playsRemaining: number;
  lastPlayDate: string | null;
}

export interface UserPrize {
  id: string;
  userId: string;
  phoneNumber: string; // Phone number for redemption
  prize: Prize;
  code: string;
  wonAt: number;
  redeemedAt: number | null;
  expiresAt: number;
}

export interface Ball {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
}

export interface Peg {
  x: number;
  y: number;
  radius: number;
  hit?: boolean; // For animation
  hitTime?: number; // Timestamp of hit
}

