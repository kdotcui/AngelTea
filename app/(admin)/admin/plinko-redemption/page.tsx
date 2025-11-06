'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { getPrizesByPhone, redeemPrize } from '@/services/plinko';
import { UserPrize } from '@/types/plinko';

export default function PlinkoRedemptionPage() {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [prizes, setPrizes] = useState<UserPrize[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSearch = async () => {
    if (phoneNumber.length < 10) {
      setError('Please enter a valid phone number');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const foundPrizes = await getPrizesByPhone(phoneNumber);
      setPrizes(foundPrizes);
      
      if (foundPrizes.length === 0) {
        setError('No active prizes found for this phone number');
      }
    } catch (err) {
      console.error('Error fetching prizes:', err);
      setError('Error fetching prizes. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleRedeem = async (prizeId: string) => {
    try {
      const success = await redeemPrize(prizeId);
      if (success) {
        // Remove redeemed prize from list
        setPrizes(prizes.filter(p => p.id !== prizeId));
        alert('Prize redeemed successfully!');
      } else {
        alert('Failed to redeem prize. It may have already been redeemed.');
      }
    } catch (err) {
      console.error('Error redeeming prize:', err);
      alert('Error redeeming prize. Please try again.');
    }
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  return (
    <div className="container mx-auto p-8 max-w-4xl">
      <h1 className="text-4xl font-bold mb-8 text-center">Plinko Prize Redemption</h1>

      {/* Phone Number Search */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Enter Customer Phone Number</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <Input
              type="tel"
              placeholder="(781) 790-5313"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              className="text-lg"
            />
            <Button
              onClick={handleSearch}
              disabled={loading}
              className="bg-blue-600 hover:bg-blue-700 px-8"
            >
              {loading ? 'Searching...' : 'Search'}
            </Button>
          </div>
          {error && (
            <p className="text-red-600 mt-2 text-sm">{error}</p>
          )}
        </CardContent>
      </Card>

      {/* Prizes List */}
      {prizes.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-2xl font-bold mb-4">
            Active Prizes ({prizes.length})
          </h2>
          
          {prizes.map((userPrize) => (
            <Card
              key={userPrize.id}
              className="border-2"
              style={{ borderColor: userPrize.prize.color }}
            >
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  {/* Prize Info */}
                  <div className="flex items-center gap-6">
                    <div
                      className="w-20 h-20 rounded-full flex items-center justify-center shadow-lg"
                      style={{ backgroundColor: userPrize.prize.color }}
                    >
                      <p
                        className="text-xl font-bold text-center"
                        style={{ color: userPrize.prize.textColor }}
                      >
                        {userPrize.prize.label}
                      </p>
                    </div>
                    
                    <div>
                      <h3 className="text-2xl font-bold mb-1">
                        {userPrize.prize.label}
                      </h3>
                      <p className="text-gray-600 mb-1">
                        Code: <span className="font-mono font-bold">{userPrize.code}</span>
                      </p>
                      <p className="text-sm text-gray-500">
                        Won: {formatDate(userPrize.wonAt)}
                      </p>
                      <p className="text-sm text-gray-500">
                        Expires: {formatDate(userPrize.expiresAt)}
                      </p>
                    </div>
                  </div>

                  {/* Redeem Button */}
                  <Button
                    onClick={() => handleRedeem(userPrize.id)}
                    className="bg-green-600 hover:bg-green-700 px-8 py-6 text-lg"
                  >
                    Redeem
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Instructions */}
      <Card className="mt-8 bg-blue-50">
        <CardHeader>
          <CardTitle>Instructions</CardTitle>
        </CardHeader>
        <CardContent>
          <ol className="list-decimal list-inside space-y-2 text-gray-700">
            <li>Ask customer for their phone number</li>
            <li>Enter the phone number and click &quot;Search&quot;</li>
            <li>Review the active prizes for that customer</li>
            <li>Click &quot;Redeem&quot; to apply the discount/prize to their order</li>
            <li>The prize will be marked as redeemed and removed from their account</li>
          </ol>
          
          <div className="mt-4 p-4 bg-yellow-100 rounded-lg border border-yellow-300">
            <p className="text-sm font-semibold text-yellow-900">
              Note: Once redeemed, prizes cannot be un-redeemed. Make sure to apply the discount before clicking &quot;Redeem&quot;.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

