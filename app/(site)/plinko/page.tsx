'use client';

import { useState, useEffect, useCallback } from 'react';
import { PlinkoGame } from '@/components/PlinkoGame';
import { PrizeModal } from '@/components/PrizeModal';
import { AuthModal } from '@/components/AuthModal';
import { Prize } from '@/types/plinko';
import { DAILY_PLAYS_LIMIT } from '@/lib/plinko/prizes';
import {
  savePrizeToFirebase,
  getUserPrizes,
  getRemainingPlays,
} from '@/services/plinko';
import { authenticateUser, getSession, saveSession } from '@/services/auth';
import { GameSession, UserPrizeEntry } from '@/types/auth';
import { useTranslations } from 'next-intl';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { trackPageView } from '@/lib/analytics';

export default function PlinkoPage() {
  const t = useTranslations('plinko');
  const [session, setSession] = useState<GameSession | null>(null);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [wonPrize, setWonPrize] = useState<Prize | null>(null);
  const [prizeCode, setPrizeCode] = useState<string>('');
  const [showPrizeModal, setShowPrizeModal] = useState(false);
  const [playsRemaining, setPlaysRemaining] = useState(DAILY_PLAYS_LIMIT);
  const [userPrizes, setUserPrizes] = useState<UserPrizeEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load game state from Firestore
  const loadGameState = useCallback(async (userId: string) => {
    try {
      const remaining = await getRemainingPlays(userId);
      setPlaysRemaining(remaining);

      const prizes = await getUserPrizes(userId);
      
      // Filter active prizes only
      const now = Date.now();
      const active = prizes.filter(p => !p.redeemedAt && p.expiresAt > now);
      
      setUserPrizes(active);
    } catch (error) {
      console.error('Error loading game state:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Check for existing session on mount
  useEffect(() => {
    const existingSession = getSession();
    if (existingSession) {
      setSession(existingSession);
      loadGameState(existingSession.userId);
    } else {
      setIsLoading(false);
    }
    trackPageView('/plinko', 'Plinko Game');
  }, [loadGameState]);

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


  const handlePrizeWon = async (prize: Prize) => {
    if (!session) return;

    setWonPrize(prize);
    setPrizeCode(''); // Reset code

    const isWin = prize.type !== 'better_luck';
    
    try {
      // Save prize to Firestore if it's a win
      if (isWin) {
        await savePrizeToFirebase(session.userId, session.phoneNumber, prize);
        setPrizeCode('SAVED');
        
        // Refresh user prizes
        const prizes = await getUserPrizes(session.userId);
        setUserPrizes(prizes);
      } else {
        // For non-wins, still increment play count
        const { incrementPlayCount } = await import('@/services/plinko');
        await incrementPlayCount(session.userId, false);
      }
    } catch (error) {
      console.error('Error saving prize:', error);
    }
    
    // Show modal
    setShowPrizeModal(true);

    // Reload game state to update play count
    await loadGameState(session.userId);
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-amber-50 to-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-amber-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">{t('loading')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50 to-white">
      <div className="max-w-6xl mx-auto px-4 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-gray-900 mb-4">
            {t('title')}
          </h1>
          <p className="text-xl text-gray-600 mb-6">
            {t('subtitle')}
          </p>
          
          {/* Plays Remaining */}
          {session && (
            <div className="inline-flex items-center gap-4 bg-white rounded-full px-6 py-3 shadow-lg border-2 border-amber-200 mb-6">
              <div className="text-center">
                <p className="text-sm text-gray-500">{t('playsRemaining')}</p>
                <p className="text-2xl font-bold text-amber-600">
                  {playsRemaining} / {DAILY_PLAYS_LIMIT}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Game Board or Sign In Prompt */}
        {session ? (
          <div className="mb-12">
            <PlinkoGame
              onPrizeWon={handlePrizeWon}
              canPlay={playsRemaining > 0}
            />
          </div>
        ) : (
          <div className="mb-12 text-center">
            <Card className="border-2 border-amber-300 bg-amber-50">
              <CardContent className="py-12">
                <h2 className="text-3xl font-bold text-gray-900 mb-4">
                  Sign In to Play
                </h2>
                <p className="text-lg text-gray-700 mb-6">
                  You need to sign in with your email and phone number to start playing Plinko.
                </p>
                <Button
                  onClick={() => setShowAuthModal(true)}
                  className="bg-amber-600 hover:bg-amber-700 text-lg px-8 py-6"
                >
                  Sign In to Play
                </Button>
              </CardContent>
            </Card>
          </div>
        )}

        {/* How to Play */}
        <Card className="mb-8 border-2 border-amber-200">
          <CardHeader>
            <CardTitle className="text-2xl">{t('howToPlay.title')}</CardTitle>
          </CardHeader>
          <CardContent>
            <ol className="list-decimal list-inside space-y-2 text-gray-700">
              <li>{t('howToPlay.step1')}</li>
              <li>{t('howToPlay.step2')}</li>
              <li>{t('howToPlay.step3')}</li>
              <li>{t('howToPlay.step4')}</li>
            </ol>
          </CardContent>
        </Card>

        {/* User's Prizes */}
        {userPrizes.length > 0 && (
          <Card className="border-2 border-amber-200">
            <CardHeader>
              <CardTitle className="text-2xl">{t('yourPrizes')}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {userPrizes.map((userPrize) => {
                  const plinkoPrize = userPrize.prize as Prize;
                  return (
                    <div
                      key={userPrize.id}
                      className="flex items-center justify-between p-4 rounded-lg border-2"
                      style={{ borderColor: plinkoPrize.color }}
                    >
                      <div className="flex items-center gap-4">
                        <div
                          className="w-12 h-12 rounded-full flex items-center justify-center font-bold text-sm"
                          style={{
                            backgroundColor: plinkoPrize.color,
                            color: plinkoPrize.textColor,
                          }}
                        >
                          {plinkoPrize.label}
                        </div>
                        <div>
                          <p className="font-semibold">{userPrize.prize.label}</p>
                          <p className="text-sm text-gray-500">
                            {t('won')}: {formatDate(userPrize.wonAt)}
                          </p>
                          <p className="text-xs text-gray-400">
                            {t('expires')}: {formatDate(userPrize.expiresAt)}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        {userPrize.redeemedAt ? (
                          <span className="text-xs text-green-600 font-semibold">
                            ✓ {t('redeemed')}
                          </span>
                        ) : (
                          <span className="text-xs text-amber-600 font-semibold">
                            {t('active')}
                          </span>
                        )}
                      </div>
                  </div>
                );
                })}
              </div>
            </CardContent>
          </Card>
        )}

        {/* No Plays Remaining Message */}
        {playsRemaining === 0 && (
          <div className="text-center mt-8 p-6 bg-amber-100 rounded-lg border-2 border-amber-300">
            <p className="text-xl font-semibold text-amber-900 mb-2">
              {t('noPlaysRemaining')}
            </p>
            <p className="text-gray-700">
              {t('comeBackTomorrow')}
            </p>
          </div>
        )}
      </div>

      {/* Auth Modal */}
      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        onAuthenticate={handleAuthenticate}
        gameName="Plinko"
      />

      {/* Prize Modal */}
      <PrizeModal
        isOpen={showPrizeModal}
        onClose={() => setShowPrizeModal(false)}
        prize={wonPrize}
        prizeCode={prizeCode}
        hasPlaysRemaining={playsRemaining > 0}
      />
    </div>
  );
}

