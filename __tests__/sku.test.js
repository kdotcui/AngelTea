const { describe, it } = require('node:test');
const assert = require('node:assert');

// Import the function - we'll need to convert the TypeScript file
// For now, let's inline it for testing
function generateSKU(productName, size, color) {
  const sanitizedName = productName
    .trim()
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, '');
  
  const parts = [sanitizedName];
  
  if (color) {
    const sanitizedColor = color.trim().toUpperCase().replace(/[^A-Z0-9]/g, '');
    if (sanitizedColor) parts.push(sanitizedColor);
  }
  
  if (size) {
    const sanitizedSize = size.trim().toUpperCase().replace(/[^A-Z0-9]/g, '');
    if (sanitizedSize) parts.push(sanitizedSize);
  }
  
  return parts.join('-');
}

describe('SKU Generation', () => {
  describe('Basic Product Names', () => {
    it('should generate SKU from simple product name', () => {
      const sku = generateSKU('T-Shirt');
      assert.strictEqual(sku, 'TSHIRT');
    });

    it('should convert product name to uppercase', () => {
      const sku = generateSKU('hoodie');
      assert.strictEqual(sku, 'HOODIE');
    });

    it('should handle product names with spaces', () => {
      const sku = generateSKU('Angel Tea Mug');
      assert.strictEqual(sku, 'ANGELTEAMUG');
    });

    it('should handle product names with special characters', () => {
      const sku = generateSKU('T-Shirt (Limited Edition)');
      assert.strictEqual(sku, 'TSHIRTLIMITEDEDITION');
    });

    it('should handle product names with numbers', () => {
      const sku = generateSKU('Poster 2024');
      assert.strictEqual(sku, 'POSTER2024');
    });
  });

  describe('Product with Size', () => {
    it('should include size in SKU', () => {
      const sku = generateSKU('T-Shirt', 'M');
      assert.strictEqual(sku, 'TSHIRT-M');
    });

    it('should handle different sizes', () => {
      const sizes = ['S', 'M', 'L', 'XL', 'XXL'];
      sizes.forEach(size => {
        const sku = generateSKU('Hoodie', size);
        assert.strictEqual(sku, `HOODIE-${size}`);
      });
    });

    it('should sanitize size with spaces', () => {
      const sku = generateSKU('Hoodie', ' XL ');
      assert.strictEqual(sku, 'HOODIE-XL');
    });
  });

  describe('Product with Color', () => {
    it('should include color in SKU', () => {
      const sku = generateSKU('T-Shirt', undefined, 'Blue');
      assert.strictEqual(sku, 'TSHIRT-BLUE');
    });

    it('should handle multi-word colors', () => {
      const sku = generateSKU('Hoodie', undefined, 'Dark Blue');
      assert.strictEqual(sku, 'HOODIE-DARKBLUE');
    });

    it('should sanitize color with special characters', () => {
      const sku = generateSKU('Mug', undefined, 'Pink & Purple');
      assert.strictEqual(sku, 'MUG-PINKPURPLE');
    });
  });

  describe('Product with Size and Color', () => {
    it('should include both color and size in correct order', () => {
      const sku = generateSKU('T-Shirt', 'M', 'Blue');
      assert.strictEqual(sku, 'TSHIRT-BLUE-M');
    });

    it('should handle complex product with all variants', () => {
      const sku = generateSKU('Angel Tea T-Shirt', 'XL', 'Navy Blue');
      assert.strictEqual(sku, 'ANGELTEATSHIRT-NAVYBLUE-XL');
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty strings for optional parameters', () => {
      const sku = generateSKU('Hoodie', '', '');
      assert.strictEqual(sku, 'HOODIE');
    });

    it('should handle whitespace-only optional parameters', () => {
      const sku = generateSKU('Mug', '   ', '   ');
      assert.strictEqual(sku, 'MUG');
    });

    it('should handle product name with leading/trailing spaces', () => {
      const sku = generateSKU('  T-Shirt  ', 'M', 'Blue');
      assert.strictEqual(sku, 'TSHIRT-BLUE-M');
    });

    it('should handle all special characters removed', () => {
      const sku = generateSKU('$%^&*', '@#$', '!@#$');
      assert.strictEqual(sku, '');
    });
  });

  describe('Real-world Examples', () => {
    it('should generate SKU for Angel Tea T-Shirt variants', () => {
      assert.strictEqual(generateSKU('Angel Tea T-Shirt', 'S', 'White'), 'ANGELTEATSHIRT-WHITE-S');
      assert.strictEqual(generateSKU('Angel Tea T-Shirt', 'M', 'Black'), 'ANGELTEATSHIRT-BLACK-M');
      assert.strictEqual(generateSKU('Angel Tea T-Shirt', 'L', 'Pink'), 'ANGELTEATSHIRT-PINK-L');
    });

    it('should generate SKU for merchandise without variants', () => {
      assert.strictEqual(generateSKU('Angel Tea Sticker'), 'ANGELTEASTICKER');
      assert.strictEqual(generateSKU('Bubble Tea Poster'), 'BUBBLETEAPOSTER');
    });

    it('should handle mug with size but no color', () => {
      assert.strictEqual(generateSKU('Travel Mug', '16oz'), 'TRAVELMUG-16OZ');
    });
  });
});

