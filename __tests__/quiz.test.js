const { describe, it } = require('node:test');
const assert = require('node:assert');
const { readFileSync } = require('fs');
const { join } = require('path');

// Load quiz questions from the actual file
const quizFilePath = join(process.cwd(), 'lib', 'quiz', 'questions.ts');
const quizContent = readFileSync(quizFilePath, 'utf-8');

// Extract the QUIZ_QUESTIONS array (simple parsing for test purposes)
const questionsMatch = quizContent.match(/export const QUIZ_QUESTIONS[^=]*=\s*(\[[\s\S]*?\]);/);
if (!questionsMatch) {
  throw new Error('Could not parse QUIZ_QUESTIONS from questions.ts');
}

// Evaluate the questions array
const QUIZ_QUESTIONS = eval(questionsMatch[1]);

describe('Personality Quiz Questions', () => {
  describe('Quiz Structure', () => {
    it('should have at least 5 questions', () => {
      assert.ok(QUIZ_QUESTIONS.length >= 5, 'Quiz should have at least 5 questions');
    });

    it('should have exactly 10 questions', () => {
      assert.strictEqual(QUIZ_QUESTIONS.length, 10, 'Quiz should have exactly 10 questions');
    });

    it('all questions should have required properties', () => {
      QUIZ_QUESTIONS.forEach((q, index) => {
        assert.ok(q.situation, `Question ${index} should have situation`);
        assert.ok(Array.isArray(q.responses), `Question ${index} should have responses array`);
      });
    });
  });

  describe('Question Situations', () => {
    it('all situations should be non-empty strings', () => {
      QUIZ_QUESTIONS.forEach((q, index) => {
        assert.ok(typeof q.situation === 'string', `Question ${index} situation should be string`);
        assert.ok(q.situation.trim().length > 0, `Question ${index} situation should not be empty`);
      });
    });

    it('all situations should be complete sentences', () => {
      QUIZ_QUESTIONS.forEach((q, index) => {
        const situation = q.situation.trim();
        const endsWithPunctuation = /[.?!:]$/.test(situation);
        assert.ok(endsWithPunctuation, `Question ${index} should end with punctuation: "${situation}"`);
      });
    });

    it('situations should be reasonably long (at least 20 characters)', () => {
      QUIZ_QUESTIONS.forEach((q, index) => {
        assert.ok(
          q.situation.length >= 20,
          `Question ${index} situation should be descriptive (at least 20 chars)`
        );
      });
    });

    it('all situations should be unique', () => {
      const situations = QUIZ_QUESTIONS.map(q => q.situation);
      const uniqueSituations = new Set(situations);
      assert.strictEqual(
        situations.length,
        uniqueSituations.size,
        'All situations should be unique'
      );
    });
  });

  describe('Question Responses', () => {
    it('each question should have exactly 2 responses', () => {
      QUIZ_QUESTIONS.forEach((q, index) => {
        assert.strictEqual(
          q.responses.length,
          2,
          `Question ${index} should have exactly 2 responses`
        );
      });
    });

    it('all responses should be non-empty strings', () => {
      QUIZ_QUESTIONS.forEach((q, index) => {
        q.responses.forEach((response, rIndex) => {
          assert.ok(
            typeof response === 'string',
            `Question ${index}, response ${rIndex} should be string`
          );
          assert.ok(
            response.trim().length > 0,
            `Question ${index}, response ${rIndex} should not be empty`
          );
        });
      });
    });

    it('responses should be reasonably long (at least 10 characters)', () => {
      QUIZ_QUESTIONS.forEach((q, index) => {
        q.responses.forEach((response, rIndex) => {
          assert.ok(
            response.length >= 10,
            `Question ${index}, response ${rIndex} should be descriptive (at least 10 chars)`
          );
        });
      });
    });

    it('both responses for each question should be different', () => {
      QUIZ_QUESTIONS.forEach((q, index) => {
        assert.notStrictEqual(
          q.responses[0],
          q.responses[1],
          `Question ${index} should have different response options`
        );
      });
    });

    it('responses should represent contrasting choices', () => {
      // This is a qualitative check - we'll just verify they're sufficiently different
      QUIZ_QUESTIONS.forEach((q, index) => {
        const response1 = q.responses[0].toLowerCase();
        const response2 = q.responses[1].toLowerCase();
        
        // Calculate simple similarity (common words)
        const words1 = response1.split(/\s+/);
        const words2 = response2.split(/\s+/);
        const commonWords = words1.filter(word => words2.includes(word) && word.length > 3);
        
        // Allow some common words but not too many (indicating they're too similar)
        assert.ok(
          commonWords.length < Math.min(words1.length, words2.length) * 0.7,
          `Question ${index} responses should be sufficiently different`
        );
      });
    });
  });

  describe('Quiz Content Quality', () => {
    it('should cover diverse personality aspects', () => {
      const allText = QUIZ_QUESTIONS.map(q => 
        q.situation + ' ' + q.responses.join(' ')
      ).join(' ').toLowerCase();
      
      // Check for diverse themes
      const themes = ['morning', 'adventure', 'social', 'work', 'drink', 'preference'];
      const foundThemes = themes.filter(theme => allText.includes(theme));
      
      assert.ok(
        foundThemes.length >= 3,
        'Quiz should cover diverse personality aspects'
      );
    });

    it('questions should be engaging (use "you" or "your")', () => {
      const engagingQuestions = QUIZ_QUESTIONS.filter(q => {
        const text = (q.situation + ' ' + q.responses.join(' ')).toLowerCase();
        return text.includes('you') || text.includes('your');
      });
      
      assert.ok(
        engagingQuestions.length >= QUIZ_QUESTIONS.length * 0.7,
        'Most questions should be personally engaging'
      );
    });

    it('should have questions about drinks/beverages', () => {
      const drinkQuestions = QUIZ_QUESTIONS.filter(q => {
        const text = (q.situation + ' ' + q.responses.join(' ')).toLowerCase();
        return /drink|beverage|tea|coffee|caffeine|sip|refreshing/.test(text);
      });
      
      assert.ok(
        drinkQuestions.length >= 2,
        'Quiz should include questions about drinks'
      );
    });
  });

  describe('Formatting', () => {
    it('situations should not have leading/trailing whitespace', () => {
      QUIZ_QUESTIONS.forEach((q, index) => {
        assert.strictEqual(
          q.situation,
          q.situation.trim(),
          `Question ${index} situation should not have extra whitespace`
        );
      });
    });

    it('responses should not have leading/trailing whitespace', () => {
      QUIZ_QUESTIONS.forEach((q, index) => {
        q.responses.forEach((response, rIndex) => {
          assert.strictEqual(
            response,
            response.trim(),
            `Question ${index}, response ${rIndex} should not have extra whitespace`
          );
        });
      });
    });

    it('responses should have proper capitalization', () => {
      QUIZ_QUESTIONS.forEach((q, index) => {
        q.responses.forEach((response, rIndex) => {
          const firstChar = response.charAt(0);
          assert.ok(
            firstChar === firstChar.toUpperCase(),
            `Question ${index}, response ${rIndex} should start with capital letter`
          );
        });
      });
    });
  });

  describe('Data Integrity', () => {
    it('quiz data should be serializable to JSON', () => {
      assert.doesNotThrow(() => {
        JSON.stringify(QUIZ_QUESTIONS);
      }, 'Quiz questions should be JSON serializable');
    });

    it('quiz data should not contain undefined or null values', () => {
      QUIZ_QUESTIONS.forEach((q, index) => {
        assert.ok(q.situation !== null && q.situation !== undefined, `Question ${index} situation exists`);
        assert.ok(q.responses !== null && q.responses !== undefined, `Question ${index} responses exist`);
        
        q.responses.forEach((response, rIndex) => {
          assert.ok(
            response !== null && response !== undefined,
            `Question ${index}, response ${rIndex} should not be null/undefined`
          );
        });
      });
    });
  });
});

