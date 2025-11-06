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

