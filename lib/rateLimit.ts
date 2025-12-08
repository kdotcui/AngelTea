/**
 * Session-based rate limiter for AI API routes
 * Uses in-memory Map for tracking request counts per session
 */

type RateLimitConfig = {
  maxRequests: number;
  windowMs: number;
};

type RateLimitEntry = {
  count: number;
  resetAt: number;
};

type RateLimitResult = {
  allowed: boolean;
  limit: number;
  remaining: number;
  resetAt: number;
};

// In-memory store for rate limit data
const rateLimitStore = new Map<string, RateLimitEntry>();

// Cleanup interval: remove expired entries every 5 minutes
const CLEANUP_INTERVAL_MS = 5 * 60 * 1000;

// Start cleanup timer
if (typeof setInterval !== 'undefined') {
  setInterval(() => {
    const now = Date.now();
    for (const [key, entry] of rateLimitStore.entries()) {
      if (entry.resetAt < now) {
        rateLimitStore.delete(key);
      }
    }
  }, CLEANUP_INTERVAL_MS);
}

/**
 * Check and update rate limit for a session
 */
export function checkRateLimit(
  sessionId: string | null | undefined,
  config: RateLimitConfig
): RateLimitResult {
  const now = Date.now();
  
  // If no session ID provided, generate a fallback identifier
  const identifier = sessionId || 'anonymous';
  
  // Get or create rate limit entry
  let entry = rateLimitStore.get(identifier);
  
  if (!entry || entry.resetAt < now) {
    // Create new window
    entry = {
      count: 0,
      resetAt: now + config.windowMs,
    };
    rateLimitStore.set(identifier, entry);
  }
  
  // Check if limit exceeded
  const allowed = entry.count < config.maxRequests;
  
  if (allowed) {
    entry.count++;
  }
  
  return {
    allowed,
    limit: config.maxRequests,
    remaining: Math.max(0, config.maxRequests - entry.count),
    resetAt: entry.resetAt,
  };
}

/**
 * Predefined rate limit configs for different API routes
 */
export const RATE_LIMITS = {
  VOICE: {
    maxRequests: 20,
    windowMs: 60 * 60 * 1000, // 1 hour
  },
  CHAT: {
    maxRequests: 30,
    windowMs: 60 * 60 * 1000, // 1 hour
  },
  PERSONALITY_QUIZ_AI: {
    maxRequests: 5,
    windowMs: 60 * 60 * 1000, // 1 hour
  },
  QUIZ_IMAGE: {
    maxRequests: 5,
    windowMs: 60 * 60 * 1000, // 1 hour
  },
} as const;

/**
 * Get session ID from request headers
 */
export function getSessionId(request: Request): string | null {
  return request.headers.get('x-session-id');
}

/**
 * Create rate limit response with appropriate headers
 */
export function createRateLimitResponse(
  result: RateLimitResult,
  message = 'Rate limit exceeded. Please try again later.'
): Response {
  const retryAfter = Math.ceil((result.resetAt - Date.now()) / 1000);
  
  return Response.json(
    {
      error: message,
      retryAfter,
    },
    {
      status: 429,
      headers: {
        'X-RateLimit-Limit': result.limit.toString(),
        'X-RateLimit-Remaining': result.remaining.toString(),
        'X-RateLimit-Reset': result.resetAt.toString(),
        'Retry-After': retryAfter.toString(),
      },
    }
  );
}

/**
 * Add rate limit headers to a successful response
 */
export function addRateLimitHeaders(
  response: Response,
  result: RateLimitResult
): Response {
  const headers = new Headers(response.headers);
  headers.set('X-RateLimit-Limit', result.limit.toString());
  headers.set('X-RateLimit-Remaining', result.remaining.toString());
  headers.set('X-RateLimit-Reset', result.resetAt.toString());
  
  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers,
  });
}

/**
 * Clear rate limit for a specific session (useful for testing)
 */
export function clearRateLimit(sessionId: string): void {
  rateLimitStore.delete(sessionId);
}

/**
 * Clear all rate limits (useful for testing)
 */
export function clearAllRateLimits(): void {
  rateLimitStore.clear();
}

