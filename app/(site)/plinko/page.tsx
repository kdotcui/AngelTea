'use client';

import { useState, useEffect } from 'react';
import { PlinkoGame } from '@/components/PlinkoGame';
import { PrizeModal } from '@/components/PrizeModal';
import { Prize, UserPrize } from '@/types/plinko';
import { DAILY_PLAYS_LIMIT } from '@/lib/plinko/prizes';
import {
  savePrizeToFirebase,
  incrementPlayCount,
  getRemainingPlays,
  getUserPrizes,
} from '@/services/plinko';
import { useTranslations } from 'next-intl';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function PlinkoPage() {
  const t = useTranslations('plinko');
  const [userId, setUserId] = useState<string>('');
  const [wonPrize, setWonPrize] = useState<Prize | null>(null);
  const [prizeCode, setPrizeCode] = useState<string>('');
  const [showPrizeModal, setShowPrizeModal] = useState(false);
  const [playsRemaining, setPlaysRemaining] = useState(DAILY_PLAYS_LIMIT);
  const [userPrizes, setUserPrizes] = useState<UserPrize[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Get or create user ID
  useEffect(() => {
    let storedUserId = localStorage.getItem('plinkoUserId');
    if (!storedUserId) {
      storedUserId = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      localStorage.setItem('plinkoUserId', storedUserId);
    }
    setUserId(storedUserId);
  }, []);

  // Load game state from Firebase
  useEffect(() => {
    if (!userId) return;

    const loadGameState = async () => {
      try {
        const remaining = await getRemainingPlays(userId, DAILY_PLAYS_LIMIT);
        setPlaysRemaining(remaining);

        const prizes = await getUserPrizes(userId);
        setUserPrizes(prizes);
      } catch (error) {
        console.error('Error loading game state:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadGameState();
  }, [userId]);

  const handlePrizeWon = async (prize: Prize) => {
    setWonPrize(prize);
    setPrizeCode(''); // Reset code

    const isWin = prize.type !== 'better_luck';
    
    // Show modal (for wins, they'll need to enter phone number)
    setShowPrizeModal(true);

    // Update play count in Firebase
    try {
      await incrementPlayCount(userId, isWin);
      const remaining = await getRemainingPlays(userId, DAILY_PLAYS_LIMIT);
      setPlaysRemaining(remaining);
    } catch (error) {
      console.error('Error updating play count:', error);
    }
  };

  const handlePhoneSubmit = async (phoneNumber: string) => {
    if (!wonPrize) return;

    try {
      const code = await savePrizeToFirebase(userId, phoneNumber, wonPrize);
      setPrizeCode(code);

      // Refresh user prizes
      const prizes = await getUserPrizes(userId);
      setUserPrizes(prizes);
    } catch (error) {
      console.error('Error saving prize:', error);
      alert('Error saving prize. Please try again.');
    }
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
            🎯 {t('title')}
          </h1>
          <p className="text-xl text-gray-600 mb-6">
            {t('subtitle')}
          </p>
          <div className="inline-flex items-center gap-4 bg-white rounded-full px-6 py-3 shadow-lg border-2 border-amber-200">
            <span className="text-2xl">🎮</span>
            <div className="text-left">
              <p className="text-sm text-gray-500">{t('playsRemaining')}</p>
              <p className="text-2xl font-bold text-amber-600">
                {playsRemaining} / {DAILY_PLAYS_LIMIT}
              </p>
            </div>
          </div>
        </div>

        {/* Game Board */}
        <div className="mb-12">
          <PlinkoGame
            onPrizeWon={handlePrizeWon}
            canPlay={playsRemaining > 0}
          />
        </div>

        {/* How to Play */}
        <Card className="mb-8 border-2 border-amber-200">
          <CardHeader>
            <CardTitle className="text-2xl">📖 {t('howToPlay.title')}</CardTitle>
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
              <CardTitle className="text-2xl">🏆 {t('yourPrizes')}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {userPrizes.map((userPrize) => (
                  <div
                    key={userPrize.id}
                    className="flex items-center justify-between p-4 rounded-lg border-2"
                    style={{ borderColor: userPrize.prize.color }}
                  >
                    <div className="flex items-center gap-4">
                      <div
                        className="w-12 h-12 rounded-full flex items-center justify-center font-bold text-sm"
                        style={{
                          backgroundColor: userPrize.prize.color,
                          color: userPrize.prize.textColor,
                        }}
                      >
                        {userPrize.prize.label}
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
                      <p className="font-mono font-bold text-lg">
                        {userPrize.code}
                      </p>
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
                ))}
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

      {/* Prize Modal */}
      <PrizeModal
        isOpen={showPrizeModal}
        onClose={() => setShowPrizeModal(false)}
        prize={wonPrize}
        prizeCode={prizeCode}
        onPhoneSubmit={handlePhoneSubmit}
      />
    </div>
  );
}

