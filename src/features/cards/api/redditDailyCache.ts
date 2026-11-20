import type { Article } from 'src/types'
import type { RedditFeedRequest } from './redditFeed'

const DAY_MS = 24 * 60 * 60 * 1000
export const REDDIT_DAILY_REQUEST_LIMIT = 20
const STORAGE_PREFIX = 'devtab-reddit-feed:'
const BUDGET_KEY = `${STORAGE_PREFIX}budget`

export class RedditFeedFailure extends Error {
  readonly retryAt?: number

  constructor(message: string, retryAt?: number) {
    super(message)
    this.retryAt = retryAt
  }
}

type FeedResult = { posts?: Article[]; error?: string }
type CacheEntry = FeedResult & { attemptedAt: number; retryAt?: number }
type CacheOptions = {
  storage?: Pick<Storage, 'getItem' | 'setItem' | 'removeItem' | 'key' | 'length'>
  locks?: Pick<LockManager, 'request'>
  now?: () => number
  providerKey?: string
}

async function hashIdentity(value: string) {
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(value))
  return Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, '0')).join('')
}

export async function loadDailyRedditFeed(
  request: RedditFeedRequest,
  load: () => Promise<Article[]>,
  { storage = localStorage, locks = navigator.locks, now = Date.now, providerKey }: CacheOptions = {}
): Promise<FeedResult> {
  const key = STORAGE_PREFIX + await hashIdentity(JSON.stringify([request.url, request.authorization]))
  const provider = providerKey ? `${STORAGE_PREFIX}provider:${await hashIdentity(providerKey)}` : undefined

  const refresh = () => locks.request(key, async () => {
    const previous: CacheEntry | null = JSON.parse(storage.getItem(key) ?? 'null')
    if (previous && now() - previous.attemptedAt < DAY_MS) return previous

    const blocked: CacheEntry | null = provider ? JSON.parse(storage.getItem(provider) ?? 'null') : null
    if (blocked?.retryAt && now() < blocked.retryAt) return { posts: previous?.posts, error: blocked.error }

    const reserved = await locks.request(BUDGET_KEY, () => {
      const attemptedAt = now()
      const day = new Date(attemptedAt).toISOString().slice(0, 10)
      const saved: { day: string; count: number } | null = JSON.parse(storage.getItem(BUDGET_KEY) ?? 'null')
      const count = saved?.day === day ? saved.count : 0
      if (count >= REDDIT_DAILY_REQUEST_LIMIT) return undefined

      if (saved?.day !== day) {
        for (let i = storage.length - 1; i >= 0; i -= 1) {
          const oldKey = storage.key(i)
          if (!oldKey?.startsWith(STORAGE_PREFIX) || oldKey === BUDGET_KEY) continue
          const entry: CacheEntry | null = JSON.parse(storage.getItem(oldKey) ?? 'null')
          if (entry && (entry.retryAt ?? 0) <= attemptedAt && attemptedAt - entry.attemptedAt > 7 * DAY_MS) {
            storage.removeItem(oldKey)
          }
        }
      }

      storage.setItem(BUDGET_KEY, JSON.stringify({ day, count: count + 1 }))
      const entry = { ...previous, attemptedAt, error: 'The last Reddit refresh did not finish.' }
      storage.setItem(key, JSON.stringify(entry))
      return entry
    })

    if (!reserved) return { posts: previous?.posts, error: 'Reddit’s daily request limit was reached.' }

    let entry: CacheEntry
    try {
      entry = { attemptedAt: reserved.attemptedAt, posts: await load() }
    } catch (error) {
      const message = error instanceof Error ? error.message : ''
      entry = {
        ...reserved,
        error: error instanceof RedditFeedFailure || /^Failed to fetch feed: HTTP \d{3}$|^This URL did not return a valid RSS or Atom feed\.$/.test(message)
          ? message
          : 'Could not refresh the Reddit feed.',
      }
      if (provider && error instanceof RedditFeedFailure && error.retryAt) {
        storage.setItem(provider, JSON.stringify({
          attemptedAt: reserved.attemptedAt,
          error: message,
          retryAt: error.retryAt,
        }))
      }
    }
    storage.setItem(key, JSON.stringify(entry))
    return entry
  })

  // Free Redlisten keys have a small concurrency limit. Hold one lock across
  // their requests so queued subreddits see provider cooldowns before fetching.
  return provider ? locks.request(provider, refresh) : refresh()
}
