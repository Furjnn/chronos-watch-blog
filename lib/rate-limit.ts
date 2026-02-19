type RateLimiterBucket = {
  count: number;
  resetAt: number;
  blockedUntil: number;
};

type RateLimitOptions = {
  windowMs: number;
  max: number;
  blockDurationMs?: number;
};

type RateLimitResult = {
  ok: boolean;
  remaining: number;
  retryAfterSeconds: number;
};

type GlobalRateLimiterState = {
  buckets: Map<string, RateLimiterBucket>;
  lastSweepAt: number;
};

const globalState = globalThis as unknown as {
  __chronosRateLimiter?: GlobalRateLimiterState;
};

const state: GlobalRateLimiterState =
  globalState.__chronosRateLimiter ||
  {
    buckets: new Map(),
    lastSweepAt: Date.now(),
  };

if (!globalState.__chronosRateLimiter) {
  globalState.__chronosRateLimiter = state;
}

function sweep(now: number) {
  if (now - state.lastSweepAt < 60_000) return;
  state.lastSweepAt = now;

  for (const [key, bucket] of state.buckets.entries()) {
    if (bucket.resetAt < now && bucket.blockedUntil < now) {
      state.buckets.delete(key);
    }
  }
}

export function checkRateLimit(key: string, options: RateLimitOptions): RateLimitResult {
  const now = Date.now();
  sweep(now);

  const current = state.buckets.get(key);
  if (current && current.blockedUntil > now) {
    return {
      ok: false,
      remaining: 0,
      retryAfterSeconds: Math.ceil((current.blockedUntil - now) / 1000),
    };
  }

  if (!current || current.resetAt <= now) {
    const nextBucket: RateLimiterBucket = {
      count: 1,
      resetAt: now + options.windowMs,
      blockedUntil: 0,
    };
    state.buckets.set(key, nextBucket);
    return {
      ok: true,
      remaining: Math.max(options.max - 1, 0),
      retryAfterSeconds: 0,
    };
  }

  current.count += 1;
  if (current.count > options.max) {
    const blockDuration = options.blockDurationMs ?? options.windowMs;
    current.blockedUntil = Math.max(current.blockedUntil, now + blockDuration);
    return {
      ok: false,
      remaining: 0,
      retryAfterSeconds: Math.ceil((current.blockedUntil - now) / 1000),
    };
  }

  return {
    ok: true,
    remaining: Math.max(options.max - current.count, 0),
    retryAfterSeconds: 0,
  };
}
