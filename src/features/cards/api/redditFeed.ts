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
