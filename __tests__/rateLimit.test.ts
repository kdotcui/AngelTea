import { describe, it, before } from 'node:test';
import assert from 'node:assert';
import {
  checkRateLimit,
  clearRateLimit,
  clearAllRateLimits,
  RATE_LIMITS,
  getSessionId,
  createRateLimitResponse,
  addRateLimitHeaders,
} from '../lib/rateLimit';

describe('Rate Limiting', () => {
  before(() => {
    // Clear all rate limits before tests
    clearAllRateLimits();
  });

  describe('checkRateLimit', () => {
    it('should allow requests within limit', () => {
      const sessionId = 'test-session-1';
      const config = { maxRequests: 5, windowMs: 60000 };

      // First 5 requests should be allowed
      for (let i = 0; i < 5; i++) {
        const result = checkRateLimit(sessionId, config);
        assert.strictEqual(result.allowed, true);
        assert.strictEqual(result.limit, 5);
        assert.strictEqual(result.remaining, 5 - i - 1);
      }

      clearRateLimit(sessionId);
    });

    it('should block requests exceeding limit', () => {
      const sessionId = 'test-session-2';
      const config = { maxRequests: 3, windowMs: 60000 };

      // First 3 requests allowed
      for (let i = 0; i < 3; i++) {
        const result = checkRateLimit(sessionId, config);
        assert.strictEqual(result.allowed, true);
      }

      // 4th request should be blocked
      const result = checkRateLimit(sessionId, config);
      assert.strictEqual(result.allowed, false);
      assert.strictEqual(result.remaining, 0);

      clearRateLimit(sessionId);
    });

    it('should reset after window expires', async () => {
      const sessionId = 'test-session-3';
      const config = { maxRequests: 2, windowMs: 100 }; // 100ms window

      // Use up the limit
      checkRateLimit(sessionId, config);
      checkRateLimit(sessionId, config);

      // Should be blocked
      let result = checkRateLimit(sessionId, config);
      assert.strictEqual(result.allowed, false);

      // Wait for window to expire
      await new Promise((resolve) => setTimeout(resolve, 150));

      // Should be allowed again
      result = checkRateLimit(sessionId, config);
      assert.strictEqual(result.allowed, true);
      assert.strictEqual(result.remaining, 1);

      clearRateLimit(sessionId);
    });

    it('should handle missing session ID', () => {
      const config = { maxRequests: 5, windowMs: 60000 };

      // Should use 'anonymous' as fallback
      const result1 = checkRateLimit(null, config);
      assert.strictEqual(result1.allowed, true);

      const result2 = checkRateLimit(undefined, config);
      assert.strictEqual(result2.allowed, true);
      assert.strictEqual(result2.remaining, 3); // 2 requests already made

      clearRateLimit('anonymous');
    });

    it('should track different sessions independently', () => {
      const config = { maxRequests: 2, windowMs: 60000 };

      // Session 1
      checkRateLimit('session-a', config);
      checkRateLimit('session-a', config);
      const resultA = checkRateLimit('session-a', config);
      assert.strictEqual(resultA.allowed, false);

      // Session 2 should still have full quota
      const resultB = checkRateLimit('session-b', config);
      assert.strictEqual(resultB.allowed, true);
      assert.strictEqual(resultB.remaining, 1);

      clearRateLimit('session-a');
      clearRateLimit('session-b');
    });

    it('should return correct resetAt timestamp', () => {
      const sessionId = 'test-session-4';
      const windowMs = 60000;
      const config = { maxRequests: 5, windowMs };

      const before = Date.now();
      const result = checkRateLimit(sessionId, config);
      const after = Date.now();

      // resetAt should be approximately now + windowMs
      assert.ok(result.resetAt >= before + windowMs);
      assert.ok(result.resetAt <= after + windowMs + 10); // 10ms tolerance

      clearRateLimit(sessionId);
    });
  });

  describe('RATE_LIMITS constants', () => {
    it('should have correct limits for VOICE', () => {
      assert.strictEqual(RATE_LIMITS.VOICE.maxRequests, 20);
      assert.strictEqual(RATE_LIMITS.VOICE.windowMs, 60 * 60 * 1000);
    });

    it('should have correct limits for CHAT', () => {
      assert.strictEqual(RATE_LIMITS.CHAT.maxRequests, 30);
      assert.strictEqual(RATE_LIMITS.CHAT.windowMs, 60 * 60 * 1000);
    });

    it('should have correct limits for PERSONALITY_QUIZ_AI', () => {
      assert.strictEqual(RATE_LIMITS.PERSONALITY_QUIZ_AI.maxRequests, 10);
      assert.strictEqual(RATE_LIMITS.PERSONALITY_QUIZ_AI.windowMs, 60 * 60 * 1000);
    });

    it('should have correct limits for QUIZ_IMAGE', () => {
      assert.strictEqual(RATE_LIMITS.QUIZ_IMAGE.maxRequests, 5);
      assert.strictEqual(RATE_LIMITS.QUIZ_IMAGE.windowMs, 60 * 60 * 1000);
    });
  });

  describe('getSessionId', () => {
    it('should extract session ID from request headers', () => {
      const request = new Request('http://localhost', {
        headers: { 'x-session-id': 'test-session-id' },
      });

      const sessionId = getSessionId(request);
      assert.strictEqual(sessionId, 'test-session-id');
    });

    it('should return null if header is missing', () => {
      const request = new Request('http://localhost');

      const sessionId = getSessionId(request);
      assert.strictEqual(sessionId, null);
    });
  });

  describe('createRateLimitResponse', () => {
    it('should create 429 response with correct headers', async () => {
      const result = {
        allowed: false,
        limit: 10,
        remaining: 0,
        resetAt: Date.now() + 3600000,
      };

      const response = createRateLimitResponse(result);

      assert.strictEqual(response.status, 429);
      assert.strictEqual(response.headers.get('X-RateLimit-Limit'), '10');
      assert.strictEqual(response.headers.get('X-RateLimit-Remaining'), '0');
      assert.ok(response.headers.has('X-RateLimit-Reset'));
      assert.ok(response.headers.has('Retry-After'));

      const body = await response.json();
      assert.ok(body.error);
      assert.ok(body.retryAfter);
    });

    it('should use custom error message', async () => {
      const result = {
        allowed: false,
        limit: 10,
        remaining: 0,
        resetAt: Date.now() + 3600000,
      };

      const response = createRateLimitResponse(result, 'Custom error message');

      const body = await response.json();
      assert.strictEqual(body.error, 'Custom error message');
    });
  });

  describe('addRateLimitHeaders', () => {
    it('should add rate limit headers to response', () => {
      const originalResponse = new Response('OK', { status: 200 });
      const result = {
        allowed: true,
        limit: 10,
        remaining: 5,
        resetAt: Date.now() + 3600000,
      };

      const response = addRateLimitHeaders(originalResponse, result);

      assert.strictEqual(response.status, 200);
      assert.strictEqual(response.headers.get('X-RateLimit-Limit'), '10');
      assert.strictEqual(response.headers.get('X-RateLimit-Remaining'), '5');
      assert.ok(response.headers.has('X-RateLimit-Reset'));
    });

    it('should preserve original response body and headers', async () => {
      const originalResponse = new Response(
        JSON.stringify({ data: 'test' }),
        {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        }
      );
      const result = {
        allowed: true,
        limit: 10,
        remaining: 5,
        resetAt: Date.now() + 3600000,
      };

      const response = addRateLimitHeaders(originalResponse, result);

      assert.strictEqual(response.headers.get('Content-Type'), 'application/json');
      const body = await response.json();
      assert.deepStrictEqual(body, { data: 'test' });
    });
  });

  describe('clearRateLimit', () => {
    it('should clear rate limit for specific session', () => {
      const sessionId = 'test-session-clear';
      const config = { maxRequests: 2, windowMs: 60000 };

      // Use up the limit
      checkRateLimit(sessionId, config);
      checkRateLimit(sessionId, config);

      // Should be blocked
      let result = checkRateLimit(sessionId, config);
      assert.strictEqual(result.allowed, false);

      // Clear and try again
      clearRateLimit(sessionId);
      result = checkRateLimit(sessionId, config);
      assert.strictEqual(result.allowed, true);
      assert.strictEqual(result.remaining, 1);

      clearRateLimit(sessionId);
    });
  });

  describe('clearAllRateLimits', () => {
    it('should clear all rate limits', () => {
      const config = { maxRequests: 1, windowMs: 60000 };

      // Create multiple sessions at limit
      checkRateLimit('session-1', config);
      checkRateLimit('session-2', config);
      checkRateLimit('session-3', config);

      // All should be blocked
      assert.strictEqual(checkRateLimit('session-1', config).allowed, false);
      assert.strictEqual(checkRateLimit('session-2', config).allowed, false);
      assert.strictEqual(checkRateLimit('session-3', config).allowed, false);

      // Clear all
      clearAllRateLimits();

      // All should be allowed again
      assert.strictEqual(checkRateLimit('session-1', config).allowed, true);
      assert.strictEqual(checkRateLimit('session-2', config).allowed, true);
      assert.strictEqual(checkRateLimit('session-3', config).allowed, true);

      clearAllRateLimits();
    });
  });

  describe('Concurrent requests', () => {
    it('should handle concurrent requests correctly', () => {
      const sessionId = 'test-concurrent';
      const config = { maxRequests: 10, windowMs: 60000 };

      // Simulate 10 concurrent requests
      const results = Array.from({ length: 10 }, () =>
        checkRateLimit(sessionId, config)
      );

      // All should be allowed
      results.forEach((result) => {
        assert.strictEqual(result.allowed, true);
      });

      // 11th should be blocked
      const blocked = checkRateLimit(sessionId, config);
      assert.strictEqual(blocked.allowed, false);

      clearRateLimit(sessionId);
    });
  });

  describe('Edge cases', () => {
    it('should handle empty string session ID', () => {
      const config = { maxRequests: 5, windowMs: 60000 };

      const result = checkRateLimit('', config);
      assert.strictEqual(result.allowed, true);

      clearRateLimit('');
    });

    it('should handle very short window', async () => {
      const sessionId = 'test-short-window';
      const config = { maxRequests: 1, windowMs: 10 }; // 10ms

      checkRateLimit(sessionId, config);
      assert.strictEqual(checkRateLimit(sessionId, config).allowed, false);

      await new Promise((resolve) => setTimeout(resolve, 20));

      assert.strictEqual(checkRateLimit(sessionId, config).allowed, true);

      clearRateLimit(sessionId);
    });

    it('should handle zero maxRequests', () => {
      const sessionId = 'test-zero-limit';
      const config = { maxRequests: 0, windowMs: 60000 };

      const result = checkRateLimit(sessionId, config);
      assert.strictEqual(result.allowed, false);
      assert.strictEqual(result.remaining, 0);

      clearRateLimit(sessionId);
    });
  });
});

