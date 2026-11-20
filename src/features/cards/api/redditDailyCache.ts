import type { Article } from 'src/types'
import type { RedditFeedRequest } from './redditFeed'

const DAY_MS = 24 * 60 * 60 * 1000
export const REDDIT_DAILY_REQUEST_LIMIT = 20
const STORAGE_PREFIX = 'devtab-reddit-feed:'
const BUDGET_KEY = `${STORAGE_PREFIX}budget`

type FeedResult = { posts?: Article[]; error?: string }
type CacheEntry = FeedResult & { attemptedAt: number }
type CacheOptions = {
  storage?: Pick<Storage, 'getItem' | 'setItem' | 'removeItem' | 'key' | 'length'>
  locks?: Pick<LockManager, 'request'>
  now?: () => number
}

export async function loadDailyRedditFeed(
  request: RedditFeedRequest,
  load: () => Promise<Article[]>,
  { storage = localStorage, locks = navigator.locks, now = Date.now }: CacheOptions = {}
): Promise<FeedResult> {
  const identity = JSON.stringify([request.url, request.authorization])
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(identity))
  const key = STORAGE_PREFIX + Array.from(new Uint8Array(digest), (value) => value.toString(16).padStart(2, '0')).join('')

  return locks.request(key, async () => {
    const previous: CacheEntry | null = JSON.parse(storage.getItem(key) ?? 'null')
    if (previous && now() - previous.attemptedAt < DAY_MS) return previous

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
          if (entry && attemptedAt - entry.attemptedAt > 7 * DAY_MS) storage.removeItem(oldKey)
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
        error: /^Failed to fetch feed: HTTP \d{3}$|^This URL did not return a valid RSS or Atom feed\.$/.test(message)
          ? message
          : 'Could not refresh the Reddit feed.',
      }
    }
    storage.setItem(key, JSON.stringify(entry))
    return entry
  })
}
