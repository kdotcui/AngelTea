import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

import {
  canonTopping,
  getMenu,
  placeOrder,
  priceForItem,
  TOPPING_PRICE,
} from '../lib/voice/menu';

describe('voice ordering logic', () => {
  it('calculates price with included toppings (no extra charge)', () => {
    const price = priceForItem('Brown Sugar Bubble Tea', 'm', ['brown sugar boba']);
    assert.equal(price, 6.59);
  });

  it('applies topping surcharge when not included', () => {
    const base = priceForItem('Brown Sugar Bubble Tea', 'l');
    const withExtra = priceForItem('Brown Sugar Bubble Tea', 'l', ['milk foam']);
    assert.equal(base, 7.49);
    assert.equal(withExtra, Number((7.49 + TOPPING_PRICE).toFixed(2)));
  });

  it('normalizes topping synonyms', () => {
    assert.equal(canonTopping('cheese foam'), 'milk foam');
    assert.equal(canonTopping('boba'), 'brown sugar boba');
  });

  it('rejects missing or invalid sizes', () => {
    assert.equal(priceForItem('Angel Milk Tea'), null);
    assert.equal(priceForItem('Angel Milk Tea', 'xl'), null);
  });

  it('places orders and normalizes sugar/ice/toppings', () => {
    const result = placeOrder([
      { name: 'Angel Milk Tea', size: 'M', qty: 2, sugar: '50%', ice: 'less ice' },
      { name: 'Brown Sugar Bubble Tea', size: 'L', toppings: ['boba', 'milk foam'], sugar: '0%' },
      { name: 'Mango Passion Green Tea', size: 'm', sugar: 'weird', ice: 'frozen' },
    ]);

    assert.equal(result.ok, true);
    if (!result.ok) return;

    const [first, second, third] = result.items;
    assert.equal(first.line_total, Number((5.99 * 2).toFixed(2)));
    assert.ok(second.toppings.includes('brown sugar boba'));
    assert.ok(second.toppings.includes('milk foam'));
    assert.equal(second.unit_price, Number((7.49 + TOPPING_PRICE).toFixed(2)));
    assert.equal(third.sugar, '100%'); // invalid sugar defaults
    assert.equal(third.ice, 'regular ice'); // invalid ice defaults

    const expectedTotal = Number(
      (first.line_total + second.line_total + third.line_total).toFixed(2),
    );
    assert.equal(result.total, expectedTotal);
  });

  it('fails when item or size is invalid', () => {
    const failed = placeOrder([{ name: 'Unknown Drink', size: 'm' }]);
    assert.equal(failed.ok, false);
  });

  it('filters menu by query', () => {
    const all = getMenu();
    const filtered = getMenu('latte');
    assert.ok(filtered.length < all.length);
    assert.ok(filtered.every((item) => item.category === 'latte'));
  });
});
