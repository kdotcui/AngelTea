const { describe, it } = require('node:test');
const assert = require('node:assert');

// Inline the prize functions for testing
const MINES_PRIZES = [
  { id: 'mines_free_drink', type: 'free_drink', label: 'Free Drink', value: 'drink', multiplier: 3.0 },
  { id: 'mines_discount_20', type: 'discount_20', label: '20% Off', value: '20', multiplier: 2.5 },
  { id: 'mines_discount_15', type: 'discount_15', label: '15% Off', value: '15', multiplier: 2.0 },
  { id: 'mines_discount_10', type: 'discount_10', label: '10% Off', value: '10', multiplier: 1.5 },
  { id: 'mines_discount_5', type: 'discount_5', label: '5% Off', value: '5', multiplier: 1.2 },
];

function calculateMultiplier(revealedCount, minesCount) {
  const totalTiles = 25;
  const safeTiles = totalTiles - minesCount;
  
  if (revealedCount === 0) return 1.0;
  
  const progress = revealedCount / safeTiles;
  const exponentialGrowth = Math.pow(progress, 1.8);
  const minesFactor = 1 + (minesCount / totalTiles) * 0.5;
  const multiplier = 1 + (exponentialGrowth * 2 * minesFactor);
  
  return Math.round(multiplier * 100) / 100;
}

function getPrizeForMultiplier(multiplier) {
  const sortedPrizes = [...MINES_PRIZES].sort((a, b) => b.multiplier - a.multiplier);
  
  for (const prize of sortedPrizes) {
    if (multiplier >= prize.multiplier) {
      return prize;
    }
  }
  
  return null;
}

function getPrizeExpiryDate() {
  return Date.now() + 30 * 24 * 60 * 60 * 1000;
}

describe('Mines Game Prizes', () => {
  describe('calculateMultiplier()', () => {
    it('should return 1.0 for zero revealed tiles', () => {
      const multiplier = calculateMultiplier(0, 5);
      assert.strictEqual(multiplier, 1.0);
    });

    it('should increase multiplier as more tiles are revealed', () => {
      const multiplier1 = calculateMultiplier(1, 5);
      const multiplier2 = calculateMultiplier(5, 5);
      const multiplier3 = calculateMultiplier(10, 5);
      
      assert.ok(multiplier1 < multiplier2, 'Multiplier should increase');
      assert.ok(multiplier2 < multiplier3, 'Multiplier should continue increasing');
    });

    it('should give higher multipliers with more mines', () => {
      const withFewMines = calculateMultiplier(10, 3);
      const withManyMines = calculateMultiplier(10, 10);
      
      assert.ok(withManyMines > withFewMines, 'More mines should give higher multiplier');
    });

    it('should round to 2 decimal places', () => {
      const multiplier = calculateMultiplier(7, 5);
      const decimals = (multiplier.toString().split('.')[1] || '').length;
      assert.ok(decimals <= 2, 'Should have at most 2 decimal places');
    });

    it('should handle edge case of all safe tiles revealed', () => {
      const minesCount = 5;
      const safeTiles = 25 - minesCount;
      const multiplier = calculateMultiplier(safeTiles, minesCount);
      
      assert.ok(multiplier > 1, 'Should have multiplier > 1 for perfect game');
      assert.ok(typeof multiplier === 'number', 'Should return a number');
    });

    it('should handle minimum mines (1)', () => {
      const multiplier = calculateMultiplier(10, 1);
      assert.ok(typeof multiplier === 'number', 'Should handle 1 mine');
      assert.ok(multiplier >= 1, 'Multiplier should be at least 1');
    });

    it('should handle maximum practical mines (15)', () => {
      const multiplier = calculateMultiplier(5, 15);
      assert.ok(typeof multiplier === 'number', 'Should handle 15 mines');
      assert.ok(multiplier >= 1, 'Multiplier should be at least 1');
    });
  });

  describe('getPrizeForMultiplier()', () => {
    it('should return null for multipliers below minimum threshold', () => {
      const prize = getPrizeForMultiplier(1.0);
      assert.strictEqual(prize, null);
    });

    it('should return 5% discount for 1.2x multiplier', () => {
      const prize = getPrizeForMultiplier(1.2);
      assert.ok(prize !== null, 'Prize should not be null');
      assert.strictEqual(prize.type, 'discount_5');
      assert.strictEqual(prize.value, '5');
    });

    it('should return 10% discount for 1.5x multiplier', () => {
      const prize = getPrizeForMultiplier(1.5);
      assert.strictEqual(prize.type, 'discount_10');
      assert.strictEqual(prize.value, '10');
    });

    it('should return 15% discount for 2.0x multiplier', () => {
      const prize = getPrizeForMultiplier(2.0);
      assert.strictEqual(prize.type, 'discount_15');
      assert.strictEqual(prize.value, '15');
    });

    it('should return 20% discount for 2.5x multiplier', () => {
      const prize = getPrizeForMultiplier(2.5);
      assert.strictEqual(prize.type, 'discount_20');
      assert.strictEqual(prize.value, '20');
    });

    it('should return free drink for 3.0x+ multiplier', () => {
      const prize = getPrizeForMultiplier(3.0);
      assert.strictEqual(prize.type, 'free_drink');
      assert.strictEqual(prize.value, 'drink');
    });

    it('should return best prize for very high multipliers', () => {
      const prize = getPrizeForMultiplier(10.0);
      assert.strictEqual(prize.type, 'free_drink');
    });

    it('should handle multipliers just below thresholds', () => {
      assert.strictEqual(getPrizeForMultiplier(1.19), null);
      assert.strictEqual(getPrizeForMultiplier(1.49).type, 'discount_5');
      assert.strictEqual(getPrizeForMultiplier(1.99).type, 'discount_10');
      assert.strictEqual(getPrizeForMultiplier(2.49).type, 'discount_15');
      assert.strictEqual(getPrizeForMultiplier(2.99).type, 'discount_20');
    });

    it('should return prize objects with all required properties', () => {
      const prize = getPrizeForMultiplier(2.0);
      assert.ok(prize.id, 'Prize should have id');
      assert.ok(prize.type, 'Prize should have type');
      assert.ok(prize.label, 'Prize should have label');
      assert.ok(prize.value, 'Prize should have value');
      assert.ok(typeof prize.multiplier === 'number', 'Prize should have multiplier');
    });
  });

  describe('getPrizeExpiryDate()', () => {
    it('should return a timestamp 30 days in the future', () => {
      const now = Date.now();
      const expiry = getPrizeExpiryDate();
      const thirtyDaysMs = 30 * 24 * 60 * 60 * 1000;
      
      // Allow 1 second tolerance for test execution time
      const diff = expiry - now;
      assert.ok(diff >= thirtyDaysMs - 1000, 'Expiry should be at least 30 days from now');
      assert.ok(diff <= thirtyDaysMs + 1000, 'Expiry should be no more than 30 days from now');
    });

    it('should return a valid timestamp', () => {
      const expiry = getPrizeExpiryDate();
      assert.ok(typeof expiry === 'number', 'Should return a number');
      assert.ok(expiry > Date.now(), 'Should be in the future');
      assert.ok(!isNaN(expiry), 'Should be a valid number');
    });

    it('should return different values when called at different times', (t, done) => {
      const expiry1 = getPrizeExpiryDate();
      
      setTimeout(() => {
        const expiry2 = getPrizeExpiryDate();
        assert.ok(expiry2 >= expiry1, 'Second call should return equal or later timestamp');
        done();
      }, 10);
    });
  });

  describe('Prize Configuration', () => {
    it('all prizes should have unique IDs', () => {
      const ids = MINES_PRIZES.map(p => p.id);
      const uniqueIds = new Set(ids);
      assert.strictEqual(ids.length, uniqueIds.size, 'All prize IDs should be unique');
    });

    it('all prizes should have valid multipliers', () => {
      MINES_PRIZES.forEach(prize => {
        assert.ok(typeof prize.multiplier === 'number', `${prize.id} should have number multiplier`);
        assert.ok(prize.multiplier > 1, `${prize.id} multiplier should be > 1`);
      });
    });

    it('prizes should be ordered by multiplier descending', () => {
      for (let i = 0; i < MINES_PRIZES.length - 1; i++) {
        assert.ok(
          MINES_PRIZES[i].multiplier > MINES_PRIZES[i + 1].multiplier,
          'Prizes should be in descending multiplier order'
        );
      }
    });

    it('all prizes should have required fields', () => {
      const requiredFields = ['id', 'type', 'label', 'value', 'multiplier'];
      
      MINES_PRIZES.forEach(prize => {
        requiredFields.forEach(field => {
          assert.ok(prize[field] !== undefined, `${prize.id} should have ${field}`);
        });
      });
    });
  });
});

