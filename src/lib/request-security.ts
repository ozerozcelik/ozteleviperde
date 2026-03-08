import { NextRequest, NextResponse } from 'next/server'
import { SITE_URL } from '@/lib/site'

type RateLimitOptions = {
  key: string
  limit: number
  windowMs: number
}

type RateLimitEntry = {
  count: number
  resetAt: number
}

type RateLimitResult = {
  ok: boolean
  retryAfterSeconds: number
}

declare global {
  var __ozteleviRateLimitStore: Map<string, RateLimitEntry> | undefined
}

const UPSTASH_REDIS_REST_URL = process.env.UPSTASH_REDIS_REST_URL?.replace(/\/$/, '')
const UPSTASH_REDIS_REST_TOKEN = process.env.UPSTASH_REDIS_REST_TOKEN?.trim()

function getRateLimitStore() {
  if (!globalThis.__ozteleviRateLimitStore) {
    globalThis.__ozteleviRateLimitStore = new Map<string, RateLimitEntry>()
  }

  return globalThis.__ozteleviRateLimitStore
}

function consumeMemoryRateLimit(
  identifier: string,
  limit: number,
  windowMs: number
): RateLimitResult {
  const now = Date.now()
  const store = getRateLimitStore()

  for (const [entryKey, entry] of store.entries()) {
    if (entry.resetAt <= now) {
      store.delete(entryKey)
    }
  }

  const current = store.get(identifier)

  if (!current || current.resetAt <= now) {
    store.set(identifier, {
      count: 1,
      resetAt: now + windowMs,
    })

    return {
      ok: true,
      retryAfterSeconds: 0,
    }
  }

  if (current.count >= limit) {
    return {
      ok: false,
      retryAfterSeconds: Math.max(
        1,
        Math.ceil((current.resetAt - now) / 1000)
      ),
    }
  }

  current.count += 1
  store.set(identifier, current)

  return {
    ok: true,
    retryAfterSeconds: 0,
  }
}

async function consumeDistributedRateLimit(
  identifier: string,
  limit: number,
  windowMs: number
): Promise<RateLimitResult> {
  if (!UPSTASH_REDIS_REST_URL || !UPSTASH_REDIS_REST_TOKEN) {
    return consumeMemoryRateLimit(identifier, limit, windowMs)
  }

  try {
    const response = await fetch(`${UPSTASH_REDIS_REST_URL}/pipeline`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${UPSTASH_REDIS_REST_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify([
        ['INCR', `ratelimit:${identifier}`],
        ['PEXPIRE', `ratelimit:${identifier}`, windowMs, 'NX'],
        ['PTTL', `ratelimit:${identifier}`],
      ]),
      cache: 'no-store',
    })

    if (!response.ok) {
      throw new Error(`Upstash rate limit request failed with ${response.status}`)
    }

    const payload = (await response.json()) as Array<{
      result?: number | string | null
      error?: string
    }>

    if (!Array.isArray(payload) || payload.some((entry) => entry?.error)) {
      throw new Error('Upstash rate limit payload was invalid')
    }

    const count = Number(payload[0]?.result ?? 0)
    const ttlMs = Math.max(1, Number(payload[2]?.result ?? windowMs))

    if (count > limit) {
      return {
        ok: false,
        retryAfterSeconds: Math.max(1, Math.ceil(ttlMs / 1000)),
      }
    }

    return {
      ok: true,
      retryAfterSeconds: 0,
    }
  } catch (error) {
    console.error('Distributed rate limit failed, falling back to memory store:', error)
    return consumeMemoryRateLimit(identifier, limit, windowMs)
  }
}

function getClientIdentifier(request: NextRequest) {
  const forwardedFor = request.headers.get('x-forwarded-for')
  const realIp = request.headers.get('x-real-ip')
  const ip = forwardedFor?.split(',')[0]?.trim() || realIp || 'unknown'
  const userAgent = request.headers.get('user-agent') || 'unknown-agent'

  return `${ip}:${userAgent.slice(0, 80)}`
}

export async function enforceRateLimit(
  request: NextRequest,
  options: RateLimitOptions
): Promise<NextResponse | null> {
  const identifier = `${options.key}:${getClientIdentifier(request)}`
  const result = await consumeDistributedRateLimit(
    identifier,
    options.limit,
    options.windowMs
  )

  if (!result.ok) {
    const retryAfterSeconds = Math.max(
      1,
      result.retryAfterSeconds || Math.ceil(options.windowMs / 1000)
    )

    return NextResponse.json(
      {
        success: false,
        error: 'Çok fazla istek gönderildi. Lütfen daha sonra tekrar deneyin.',
      },
      {
        status: 429,
        headers: {
          'Retry-After': retryAfterSeconds.toString(),
        },
      }
    )
  }

  return null
}

export async function enforceIdentifierRateLimit(
  identifier: string,
  options: Omit<RateLimitOptions, 'key'>
) {
  return consumeDistributedRateLimit(identifier, options.limit, options.windowMs)
}

function getAllowedOrigins() {
  const canonicalOrigin = new URL(SITE_URL).origin
  const origins = new Set<string>([canonicalOrigin])

  const vercelUrl = process.env.VERCEL_URL?.trim()
  if (vercelUrl) {
    origins.add(`https://${vercelUrl.replace(/^https?:\/\//, '')}`)
  }

  if (canonicalOrigin.includes('www.')) {
    origins.add(canonicalOrigin.replace('://www.', '://'))
  } else {
    origins.add(canonicalOrigin.replace('://', '://www.'))
  }

  if (process.env.NODE_ENV !== 'production') {
    origins.add('http://localhost:3000')
    origins.add('http://127.0.0.1:3000')
  }

  return origins
}

export function enforceTrustedOrigin(
  request: NextRequest
): NextResponse | null {
  const origin = request.headers.get('origin')

  if (!origin) {
    return null
  }

  if (!getAllowedOrigins().has(origin)) {
    return NextResponse.json(
      {
        success: false,
        error: 'Geçersiz istek kaynağı.',
      },
      { status: 403 }
    )
  }

  return null
}
