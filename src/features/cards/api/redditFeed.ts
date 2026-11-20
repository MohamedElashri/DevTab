import type { Article } from 'src/types'

export const REDLISTEN_ORIGIN = 'https://api.redlisten.com'
export const REDLISTEN_DASHBOARD = 'https://app.redlisten.com/'
export const DEFAULT_REDDIT_POST_LIMIT = 25
export const REDDIT_POST_LIMITS = [10, DEFAULT_REDDIT_POST_LIMIT, 50] as const
const TECH_SUBREDDITS = ['compsci', 'programming', 'technology']
const SUBREDDIT_ALIASES: Record<string, string> = { 'c++': 'cpp', 'c#': 'csharp', artificialintelligence: 'artificial' }

export type RedditFeedRequest = { url: string; authorization: string; subreddits: string[] }

export function parseRedlistenKey(input: string): string | undefined {
  const value = input.trim().replace(/^(["'`])(.+)\1$/, '$2').trim()
  let key = value.replace(/^(?:Authorization:[ \t]*)?Bearer[ \t]+/i, '')
  if (/^https:\/\//i.test(key)) {
    try {
      const url = new URL(key)
      if (url.origin !== REDLISTEN_ORIGIN || url.username || url.password) return undefined
      key = url.searchParams.get('key') ?? ''
    } catch {
      return undefined
    }
  }

  return /^[a-z0-9._~+/-]+=*$/i.test(key) ? key : undefined
}

export function normalizeRedditPostLimit(value: number) {
  return REDDIT_POST_LIMITS.find((limit) => limit === value) ?? DEFAULT_REDDIT_POST_LIMIT
}

export function redlistenFeedRequest(topics: string[], key: string, postLimit = DEFAULT_REDDIT_POST_LIMIT): RedditFeedRequest {
  const names = topics.map((topic) => {
    const normalized = topic.trim().replace(/^r\//i, '').replace(/\s+/g, '').toLowerCase()
    return Object.hasOwn(SUBREDDIT_ALIASES, normalized) ? SUBREDDIT_ALIASES[normalized] : normalized
  })
  const selected = [...new Set(names.filter((name) => /^[a-z0-9_]{2,21}$/.test(name)))].sort()
  const subreddits = selected.length ? selected : TECH_SUBREDDITS
  return {
    url: `${REDLISTEN_ORIGIN}/r/${subreddits.join('+')}/new.rss?limit=${normalizeRedditPostLimit(postLimit)}`,
    authorization: `Bearer ${key}`,
    subreddits,
  }
}

export async function getRedlistenError(response: Response, now = Date.now()) {
  const { status } = response
  if (status === 401) {
    return {
      message: 'Redlisten rejected this key. Check it in your dashboard.',
      retryAt: now + 24 * 60 * 60 * 1000,
    }
  }
  if (status === 403) return { message: 'Redlisten denied access to this feed. Check your plan in the dashboard.' }
  if (status === 404) return { message: 'Redlisten couldn’t find this subreddit feed.' }
  if (status >= 500) return { message: `Redlisten could not serve the feed (HTTP ${status}).` }
  if (status !== 429) return { message: `Redlisten rejected the feed request (HTTP ${status}).` }

  const details = await response.json().catch(() => null)
  const code = details?.error?.code
  const retryAfter = response.headers.get('retry-after')
  const retryAt = retryAfter && /^\d+$/.test(retryAfter)
    ? now + Number(retryAfter) * 1000
    : Date.parse(retryAfter ?? '')
  const validRetryAt = Number.isFinite(retryAt) && retryAt > now ? retryAt : undefined

  if (code === 'quota_exceeded' || code === 'items_quota_exceeded') {
    const date = new Date(now)
    return {
      message: code === 'quota_exceeded'
        ? 'Redlisten’s monthly request quota is exhausted. It resets at the start of the next UTC month.'
        : 'Redlisten’s monthly results quota is exhausted. It resets at the start of the next UTC month.',
      retryAt: validRetryAt ?? Date.UTC(date.getUTCFullYear(), date.getUTCMonth() + 1, 1),
    }
  }

  return {
    message: code === 'too_many_in_flight'
      ? 'Redlisten has too many requests in progress for this account.'
      : 'Redlisten temporarily rate-limited this feed.',
    retryAt: validRetryAt ?? now + 60_000,
  }
}

export function getRedditFeedItems(entries: Article[], topics: string[]): Article[] {
  const selectedTopics = new Set(topics.filter(Boolean).map((topic) => topic.toLowerCase()))
  const posts = new Map<string, Article>()

  for (const entry of entries) {
    let url: URL
    try {
      url = new URL(entry.url)
    } catch {
      continue
    }
    if (!/^https?:$/.test(url.protocol) || !/(^|\.)reddit\.com$/.test(url.hostname)) continue

    const thread = /^\/r\/([a-z0-9_]+)\/comments\/([a-z0-9]+)(?:\/|$)/i.exec(url.pathname)
    if (!thread) continue

    const subreddit = thread[1].toLowerCase()
    const id = thread[2].toLowerCase()
    if (selectedTopics.size && !selectedTopics.has(subreddit)) continue

    const previous = posts.get(id)
    if (previous && previous.published_at >= entry.published_at) continue

    const permalink = `https://www.reddit.com${url.pathname}`
    posts.set(id, {
      ...entry,
      id,
      url: permalink,
      canonical_url: permalink,
      source: 'reddit',
      tags: [subreddit],
    })
  }

  return [...posts.values()]
}
