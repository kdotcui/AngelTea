const { readFileSync } = require('fs');
const { join } = require('path');
const { describe, it } = require('node:test');
const assert = require('node:assert');

// Helper function to get all nested keys
function getAllKeys(obj, prefix = '') {
  let keys = [];
  
  for (const key in obj) {
    const fullKey = prefix ? `${prefix}.${key}` : key;
    
    if (typeof obj[key] === 'object' && obj[key] !== null) {
      keys.push(...getAllKeys(obj[key], fullKey));
    } else {
      keys.push(fullKey);
    }
  }
  
  return keys;
}

describe('Translation Files', () => {
  const languages = ['en', 'es', 'zh'];
  const translations = {};

  // Load all translation files
  languages.forEach((lang) => {
    const filePath = join(process.cwd(), 'messages', `${lang}.json`);
    const content = readFileSync(filePath, 'utf-8');
    translations[lang] = JSON.parse(content);
  });

  describe('File Structure', () => {
    it('all translation files should exist and be objects', () => {
      languages.forEach((lang) => {
        assert.ok(translations[lang], `${lang} translation should exist`);
        assert.strictEqual(typeof translations[lang], 'object', `${lang} should be an object`);
      });
    });

    it('all files should have the same top-level keys', () => {
      const enKeys = Object.keys(translations.en).sort();
      
      languages.forEach((lang) => {
        const langKeys = Object.keys(translations[lang]).sort();
        assert.deepStrictEqual(langKeys, enKeys, `${lang} should have same top-level keys as en`);
      });
    });
  });

  describe('Key Consistency', () => {
    it('all languages should have the same nested keys', () => {
      const enKeys = getAllKeys(translations.en).sort();
      
      languages.forEach((lang) => {
        const langKeys = getAllKeys(translations[lang]).sort();
        assert.deepStrictEqual(langKeys, enKeys, `${lang} should have all the same keys as en`);
      });
    });

    it('no translation values should be empty strings', () => {
      languages.forEach((lang) => {
        const allKeys = getAllKeys(translations[lang]);
        
        allKeys.forEach((keyPath) => {
          const keys = keyPath.split('.');
          let value = translations[lang];
          
          keys.forEach((key) => {
            value = value[key];
          });
          
          assert.ok(value, `${lang}.${keyPath} should not be empty`);
          assert.strictEqual(typeof value, 'string', `${lang}.${keyPath} should be a string`);
          assert.ok(value.trim().length > 0, `${lang}.${keyPath} should not be whitespace`);
        });
      });
    });
  });

  describe('Required Sections', () => {
    const requiredSections = [
      'common',
      'navigation',
      'footer',
      'hero',
      'menu',
      'about',
      'testimonials',
      'visit',
      'faqs',
      'press',
      'shop',
      'admin',
      'rewards',
      'plinko'
    ];

    it('all languages should have required sections', () => {
      languages.forEach((lang) => {
        requiredSections.forEach((section) => {
          assert.ok(translations[lang][section], `${lang} should have ${section} section`);
          assert.strictEqual(typeof translations[lang][section], 'object', `${lang}.${section} should be an object`);
        });
      });
    });
  });

  describe('Navigation Keys', () => {
    const requiredNavKeys = [
      'shop',
      'popular',
      'menu',
      'about',
      'visit',
      'press',
      'rewards'
    ];

    it('all languages should have navigation keys', () => {
      languages.forEach((lang) => {
        requiredNavKeys.forEach((key) => {
          assert.ok(translations[lang].navigation[key], `${lang}.navigation.${key} should exist`);
        });
      });
    });
  });

  describe('Plinko Game Translations', () => {
    const requiredPlinkoKeys = [
      'title',
      'subtitle',
      'loading',
      'playsRemaining',
      'yourPrizes',
      'congratulations',
      'close'
    ];

    it('all languages should have plinko game keys', () => {
      languages.forEach((lang) => {
        requiredPlinkoKeys.forEach((key) => {
          assert.ok(translations[lang].plinko[key], `${lang}.plinko.${key} should exist`);
        });
      });
    });

    it('plinko howToPlay should have all steps', () => {
      const steps = ['title', 'step1', 'step2', 'step3', 'step4'];
      
      languages.forEach((lang) => {
        steps.forEach((step) => {
          assert.ok(translations[lang].plinko.howToPlay[step], `${lang}.plinko.howToPlay.${step} should exist`);
        });
      });
    });
  });

  describe('Rewards Program Translations', () => {
    it('all languages should have rewards membership plans', () => {
      languages.forEach((lang) => {
        assert.ok(translations[lang].rewards.membership, `${lang} should have rewards.membership`);
        assert.ok(translations[lang].rewards.membership.annual, `${lang} should have annual plan`);
        assert.ok(translations[lang].rewards.membership.monthly, `${lang} should have monthly plan`);
        
        // Check annual plan
        assert.ok(translations[lang].rewards.membership.annual.plan_name, `${lang} annual plan should have name`);
        assert.ok(translations[lang].rewards.membership.annual.join_button, `${lang} annual plan should have join button`);
        
        // Check monthly plan
        assert.ok(translations[lang].rewards.membership.monthly.plan_name, `${lang} monthly plan should have name`);
        assert.ok(translations[lang].rewards.membership.monthly.join_button, `${lang} monthly plan should have join button`);
      });
    });

    it('all languages should have rewards redemption options', () => {
      const redeemOptions = ['drink', 'appetizer', 'shirt'];
      
      languages.forEach((lang) => {
        redeemOptions.forEach((option) => {
          assert.ok(translations[lang].rewards.redeem[option], `${lang} should have ${option} redemption`);
          assert.ok(translations[lang].rewards.redeem[option].points, `${lang} ${option} should have points`);
          assert.ok(translations[lang].rewards.redeem[option].title, `${lang} ${option} should have title`);
          assert.ok(translations[lang].rewards.redeem[option].description, `${lang} ${option} should have description`);
        });
      });
    });
  });

  describe('Special Characters', () => {
    it('Spanish translations should contain appropriate special characters', () => {
      const esText = JSON.stringify(translations.es);
      // Check for common Spanish characters
      assert.ok(/[áéíóúñü]/i.test(esText), 'Spanish should contain special characters');
    });

    it('Chinese translations should contain Chinese characters', () => {
      const zhText = JSON.stringify(translations.zh);
      // Check for Chinese characters (Unicode range)
      assert.ok(/[\u4e00-\u9fa5]/.test(zhText), 'Chinese should contain Chinese characters');
    });
  });

  describe('Placeholder Consistency', () => {
    it('placeholders should be consistent across languages', () => {
      // Check for actual template placeholders like {prize}, {name}, etc.
      // Not JSON structure braces
      const allKeys = getAllKeys(translations.en);
      const placeholderKeys = allKeys.filter(keyPath => {
        const keys = keyPath.split('.');
        let value = translations.en;
        keys.forEach((key) => {
          value = value[key];
        });
        return typeof value === 'string' && /\{[a-zA-Z_][a-zA-Z0-9_]*\}/g.test(value);
      });
      
      if (placeholderKeys.length > 0) {
        placeholderKeys.forEach((keyPath) => {
          const keys = keyPath.split('.');
          let enValue = translations.en;
          keys.forEach((key) => {
            enValue = enValue[key];
          });
          
          const enPlaceholders = enValue.match(/\{[a-zA-Z_][a-zA-Z0-9_]*\}/g) || [];
          
          languages.forEach((lang) => {
            let langValue = translations[lang];
            keys.forEach((key) => {
              langValue = langValue[key];
            });
            
            enPlaceholders.forEach((placeholder) => {
              assert.ok(langValue.includes(placeholder), `${lang}.${keyPath} should contain placeholder ${placeholder}`);
            });
          });
        });
      } else {
        // If no placeholders found, test passes
        assert.ok(true, 'No placeholders to validate');
      }
    });
  });
});

