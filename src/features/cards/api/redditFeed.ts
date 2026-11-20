import type { Article } from 'src/types'

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
