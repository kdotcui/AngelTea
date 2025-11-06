'use client';

import { useState } from 'react';
import { Prize } from '@/types/plinko';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useTranslations } from 'next-intl';

interface PrizeModalProps {
  isOpen: boolean;
  onClose: () => void;
  prize: Prize | null;
  prizeCode?: string;
  onPhoneSubmit?: (phoneNumber: string) => void;
  hasPlaysRemaining?: boolean;
}

export function PrizeModal({ isOpen, onClose, prize, prizeCode, onPhoneSubmit, hasPlaysRemaining = true }: PrizeModalProps) {
  const t = useTranslations('plinko');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [phoneSubmitted, setPhoneSubmitted] = useState(false);

  if (!prize) return null;

  const isWin = prize.type !== 'better_luck';

  // Show phone input for wins if no code yet
  const needsPhone = isWin && !prizeCode && !phoneSubmitted;

  const handlePhoneSubmit = () => {
    // Normalize phone number (remove spaces, dashes, parentheses)
    const normalized = phoneNumber.replace(/\D/g, '');
    
    if (normalized.length >= 10) {
      setPhoneSubmitted(true);
      if (onPhoneSubmit) {
        onPhoneSubmit(normalized);
      }
    } else {
      alert('Please enter a valid phone number');
    }
  };

  const copyToClipboard = () => {
    if (prizeCode) {
      navigator.clipboard.writeText(prizeCode);
      alert('Code copied to clipboard!');
    }
  };

  const handleClose = () => {
    setPhoneNumber('');
    setPhoneSubmitted(false);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
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
                
                {/* Phone Number Input */}
                {needsPhone && (
                  <div className="bg-blue-50 border-2 border-blue-300 rounded-lg p-4 space-y-3">
                    <p className="text-sm font-semibold text-gray-700">
                      {t('enterPhoneNumber')}
                    </p>
                    <Input
                      type="tel"
                      placeholder={t('phoneNumberPlaceholder')}
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                      className="text-center text-lg"
                      maxLength={14}
                    />
                    <Button
                      onClick={handlePhoneSubmit}
                      className="w-full bg-blue-600 hover:bg-blue-700"
                      disabled={phoneNumber.length < 10}
                    >
                      {t('claimPrize')}
                    </Button>
                    <p className="text-xs text-gray-500">
                      {t('phoneNumberInstructions')}
                    </p>
                  </div>
                )}

                {/* Show code after phone submitted */}
                {prizeCode && (
                  <div className="bg-amber-50 border-2 border-amber-300 rounded-lg p-4 space-y-2">
                    <p className="text-sm text-gray-600">{t('yourCode')}</p>
                    <p className="text-2xl font-mono font-bold text-amber-900 tracking-wider">
                      {prizeCode}
                    </p>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={copyToClipboard}
                      className="w-full"
                    >
                      {t('copyCode')}
                    </Button>
                    <p className="text-xs text-gray-500 mt-2">
                      {t('givePhoneAtCheckout')}
                    </p>
                  </div>
                )}
                
                {!needsPhone && !prizeCode && (
                  <p className="text-sm text-gray-500 mt-4">
                    {t('processingPrize')}
                  </p>
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
            <Button onClick={handleClose} className="flex-1 bg-amber-600 hover:bg-amber-700">
              {t('close')}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

