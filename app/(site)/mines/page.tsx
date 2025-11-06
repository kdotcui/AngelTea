'use client';

import { useState, useEffect } from 'react';
import { MinesGame } from '@/components/MinesGame';
import { AuthModal } from '@/components/AuthModal';
import { MinesPrize } from '@/types/mines';
import { DAILY_PLAYS_LIMIT, MINES_PRIZES } from '@/lib/mines/prizes';
import {
  saveMinesPrizeToFirebase,
  getRemainingMinesPlays,
  incrementMinesPlayCount,
} from '@/services/mines';
import { authenticateUser, getSession, saveSession } from '@/services/auth';
import { GameSession } from '@/types/auth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export default function MinesPage() {
  const minesCount = 5; // Fixed at 5 mines
  const [session, setSession] = useState<GameSession | null>(null);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [playsRemaining, setPlaysRemaining] = useState(DAILY_PLAYS_LIMIT);
  const [isLoading, setIsLoading] = useState(true);

  // Check for existing session on mount
  useEffect(() => {
    const existingSession = getSession();
    if (existingSession) {
      setSession(existingSession);
      loadGameState(existingSession.userId);
    } else {
      setIsLoading(false);
    }
  }, []);

  // Load game state from Firestore
  const loadGameState = async (userId: string) => {
    try {
      const remaining = await getRemainingMinesPlays(userId);
      setPlaysRemaining(remaining);
    } catch (error) {
      console.error('Error loading game state:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle authentication
  const handleAuthenticate = async (email: string, phoneNumber: string) => {
    try {
      const user = await authenticateUser(email, phoneNumber);
      const newSession: GameSession = {
        userId: user.id,
        email: user.email,
        phoneNumber: user.phoneNumber,
        authenticatedAt: Date.now(),
      };
      
      saveSession(newSession);
      setSession(newSession);
      setShowAuthModal(false);
      
      // Load game state for this user
      await loadGameState(user.id);
    } catch (error) {
      throw error; // Let AuthModal handle the error display
    }
  };

  const handleGameEnd = async (won: boolean, prize: MinesPrize | null) => {
    if (!session) return;

    try {
      if (won && prize) {
        await saveMinesPrizeToFirebase(session.userId, session.phoneNumber, prize);
      } else {
        // For non-wins, still increment play count
        await incrementMinesPlayCount(session.userId, false);
      }
    } catch (error) {
      console.error('Error saving prize:', error);
    }

    // Reload game state to update play count
    await loadGameState(session.userId);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-gray-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading game...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <div className="max-w-6xl mx-auto px-4 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-gray-900 mb-4">
            Mines Game
          </h1>
          <p className="text-xl text-gray-600 mb-6">
            Reveal tiles to win prizes - avoid the mines!
          </p>
          
          {/* Plays Remaining */}
          {session && (
            <div className="inline-flex items-center gap-4 bg-white rounded-full px-6 py-3 shadow-lg border-2 border-gray-300 mb-6">
              <div className="text-center">
                <p className="text-sm text-gray-500">Plays Remaining Today</p>
                <p className="text-2xl font-bold text-gray-700">
                  {playsRemaining} / {DAILY_PLAYS_LIMIT}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Game Board or Sign In Prompt */}
        {session ? (
          <div className="mb-12">
            <MinesGame
              minesCount={minesCount}
              onGameEnd={handleGameEnd}
              canPlay={playsRemaining > 0}
            />
          </div>
        ) : (
          <div className="mb-12 text-center">
            <Card className="border-2 border-gray-300 bg-gray-50">
              <CardContent className="py-12">
                <h2 className="text-3xl font-bold text-gray-900 mb-4">
                  Sign In to Play
                </h2>
                <p className="text-lg text-gray-700 mb-6">
                  You need to sign in with your email and phone number to start playing Mines.
                </p>
                <Button
                  onClick={() => setShowAuthModal(true)}
                  className="bg-gray-800 hover:bg-gray-900 text-lg px-8 py-6"
                >
                  Sign In to Play
                </Button>
              </CardContent>
            </Card>
          </div>
        )}

        {/* How to Play */}
        <Card className="mb-8 border-2 border-gray-300">
          <CardHeader>
            <CardTitle className="text-2xl">How to Play</CardTitle>
          </CardHeader>
          <CardContent>
            <ol className="list-decimal list-inside space-y-2 text-gray-700">
              <li>Choose the number of mines (difficulty level)</li>
              <li>Click &quot;Start Game&quot; to begin</li>
              <li>Click tiles to reveal them - avoid the mines!</li>
              <li>Each safe tile increases your multiplier</li>
              <li>Cash out anytime to claim your prize</li>
              <li>Hit a mine = Game over, no prize</li>
              <li>You get {DAILY_PLAYS_LIMIT} plays per day</li>
            </ol>
          </CardContent>
        </Card>

        {/* Prize Table */}
        <Card className="border-2 border-gray-300">
          <CardHeader>
            <CardTitle className="text-2xl">Prize Multipliers</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {MINES_PRIZES.map((prize) => (
                <div
                  key={prize.id}
                  className="flex justify-between items-center p-3 rounded-lg bg-gray-50 border border-gray-200"
                >
                  <span className="font-semibold text-gray-800">{prize.label}</span>
                  <span className="text-amber-600 font-bold">{prize.multiplier.toFixed(1)}x or higher</span>
                </div>
              ))}
            </div>
            <p className="text-sm text-gray-500 mt-4 text-center">
              Reach the multiplier to win the prize!
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Auth Modal */}
      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        onAuthenticate={handleAuthenticate}
        gameName="Mines"
      />
    </div>
  );
}

