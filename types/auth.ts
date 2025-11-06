import { Prize } from './plinko';
import { MinesPrize } from './mines';

export interface UserPrizeEntry {
  id: string;
  prize: Prize | MinesPrize;
  wonAt: number;
  redeemedAt: number | null;
  expiresAt: number;
  gameType: 'plinko' | 'mines';
}

export interface GameUser {
  id: string;
  email: string;
  phoneNumber: string;
  createdAt: number;
  lastLoginAt: number;
  // Plinko game state
  plinkoPlaysRemaining: number;
  plinkoLastPlayDate: string;
  // Mines game state
  minesPlaysRemaining: number;
  minesLastPlayDate: string;
  // Prizes won (array of all prizes from both games)
  prizes: UserPrizeEntry[];
  // Admin flag for unlimited plays
  isAdmin?: boolean;
}

export interface GameSession {
  userId: string;
  email: string;
  phoneNumber: string;
  authenticatedAt: number;
}

