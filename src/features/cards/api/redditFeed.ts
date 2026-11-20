import type { Article } from 'src/types'

export const REDLISTEN_ORIGIN = 'https://api.redlisten.com'
export const REDLISTEN_DASHBOARD = 'https://app.redlisten.com/'
export const TECH_SUBREDDITS = ['programming', 'technology', 'compsci']
const SUBREDDIT_TOKEN = '{subreddit}'

export type RedditFeedRequest = { url: string; authorization?: string }

export const hasSubredditTemplate = (url?: string) => Boolean(url?.includes(SUBREDDIT_TOKEN))

export function getRedditSubreddits(topics: string[]) {
  const names = topics.map((topic) => topic.trim().replace(/^r\//i, '').toLowerCase())
  return [...new Set(names.filter((name) => /^[a-z0-9_]{2,21}$/.test(name)))]
}

export function resolveRedditFeedUrl(input: string, subreddit: string): string {
  if (!/^[a-z0-9_]{2,21}$/i.test(subreddit)) throw new Error('Invalid subreddit name.')
  const url = new URL(input.replaceAll(SUBREDDIT_TOKEN, subreddit))
  if (!/^https?:$/.test(url.protocol) || url.username || url.password) {
    throw new Error('Enter an HTTP or HTTPS feed URL without a username or password.')
  }

  if (hasSubredditTemplate(input)) {
    const test = new URL(input.replaceAll(SUBREDDIT_TOKEN, 'devtab_placeholder'))
    if (url.origin !== test.origin || !`${test.pathname}${test.search}`.includes('devtab_placeholder')) {
      throw new Error('Place {subreddit} in the URL path or query.')
    }
  }

  url.hash = ''
  return url.href
}

export function redlistenFeedRequest(subreddit: string, key: string): RedditFeedRequest {
  return {
    url: resolveRedditFeedUrl(`${REDLISTEN_ORIGIN}/r/{subreddit}/new.rss?limit=10`, subreddit),
    authorization: `Bearer ${key}`,
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

export function mergeRedditSubreddits(feeds: Article[][], limit: number): Article[] {
  const sorted = feeds.map((feed) => feed.slice().sort((a, b) => b.published_at - a.published_at))
  const unique = new Map<string, Article>()
  const rounds = Math.max(0, ...sorted.map((feed) => feed.length))
  for (let index = 0; index < rounds && unique.size < limit; index += 1) {
    for (const feed of sorted) {
      const item = feed[index]
      if (item && !unique.has(item.id)) unique.set(item.id, item)
      if (unique.size === limit) break
    }
  }
  return [...unique.values()]
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
