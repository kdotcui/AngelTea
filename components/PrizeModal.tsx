'use client';

import { Prize } from '@/types/plinko';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useTranslations } from 'next-intl';

interface PrizeModalProps {
  isOpen: boolean;
  onClose: () => void;
  prize: Prize | null;
  prizeCode?: string;
  hasPlaysRemaining?: boolean;
}

export function PrizeModal({ isOpen, onClose, prize, prizeCode, hasPlaysRemaining = true }: PrizeModalProps) {
  const t = useTranslations('plinko');

  if (!prize) return null;

  const isWin = prize.type !== 'better_luck';

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-2xl text-center">
            {isWin ? '🎉 ' + t('congratulations') : t('tryAgain')}
          </DialogTitle>
          <DialogDescription className="sr-only">
            {isWin ? t('youWon', { prize: prize.label }) : t('betterLuckMessage')}
          </DialogDescription>
        </DialogHeader>
        
        <div className="flex flex-col items-center gap-6 py-6">
          {/* Prize Display */}
          <div
            className="w-32 h-32 rounded-full flex items-center justify-center shadow-lg"
            style={{ backgroundColor: prize.color }}
          >
            <p
              className="text-3xl font-bold text-center px-4"
              style={{ color: prize.textColor }}
            >
              {prize.label}
            </p>
          </div>

          {/* Prize Description */}
          <div className="text-center space-y-2 w-full">
            {isWin ? (
              <>
                <p className="text-lg font-semibold">
                  {t('youWon', { prize: prize.label })}
                </p>
                
                {prizeCode && (
                  <div className="bg-green-50 border-2 border-green-300 rounded-lg p-4 space-y-2">
                    <p className="text-lg font-semibold text-green-800">
                      {t('prizeSaved')}
                    </p>
                    <p className="text-sm text-gray-600">
                      {t('givePhoneAtCheckout')}
                    </p>
                  </div>
                )}
                
                <p className="text-xs text-gray-400 mt-4">
                  {t('expiresIn30Days')}
                </p>
              </>
            ) : (
              <p className="text-gray-600">
                {hasPlaysRemaining ? t('betterLuckMessage') : t('comeBackTomorrow')}
              </p>
            )}
          </div>

          {/* Actions */}
          <div className="flex gap-3 w-full">
            <Button onClick={onClose} className="flex-1 bg-amber-600 hover:bg-amber-700">
              {t('close')}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

