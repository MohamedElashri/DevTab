import { useEffect, useMemo, useState } from 'react'
import { MAX_ITEMS_PER_CARD } from 'src/config'
import type { Article } from 'src/types'
import { loadRedditFeed } from '../api/loadRedditFeed'
import {
  getRedditSubreddits,
  hasSubredditTemplate,
  mergeRedditSubreddits,
  redlistenFeedRequest,
  resolveRedditFeedUrl,
  TECH_SUBREDDITS,
} from '../api/redditFeed'

export function useRedditFeed(feedUrl: string | undefined, key: string | undefined, topics: string[], enabled: boolean) {
  const selection = useMemo(() => ({ feedUrl, key, topics }), [feedUrl, key, topics])
  const [result, setResult] = useState<{
    selection: typeof selection
    posts: Article[]
    error?: string
    partial?: boolean
  }>()

  useEffect(() => {
    if (!enabled || (!selection.key && !selection.feedUrl)) return
    let canceled = false
    const load = async () => {
      const { feedUrl, key, topics } = selection
      const input = feedUrl ?? ''
      const names = getRedditSubreddits(topics)
      const filtered = topics.some(Boolean)
      const targets = filtered ? names : TECH_SUBREDDITS
      const group = Boolean(key) || hasSubredditTemplate(feedUrl)
      const requests = group
        ? targets.map((subreddit) => ({
            subreddit,
            ...(key ? redlistenFeedRequest(subreddit, key) : { url: resolveRedditFeedUrl(input, subreddit) }),
          }))
        : [{ subreddit: '', url: resolveRedditFeedUrl(input, TECH_SUBREDDITS[0]) }]
      const feeds = await Promise.all(requests.map(async (request) => {
        const feed = await loadRedditFeed(request)
        const posts = (feed.posts || []).filter((post) => {
          if (request.subreddit) return post.tags.includes(request.subreddit)
          return !filtered || names.includes(post.tags[0])
        })
        return { posts, error: feed.error }
      }))
      const posts = group
        ? mergeRedditSubreddits(feeds.map((feed) => feed.posts), MAX_ITEMS_PER_CARD)
        : feeds[0].posts
      const error = feeds.find((feed) => feed.error)?.error
      if (!canceled) setResult({ selection, posts, error, partial: Boolean(error && posts.length) })
    }
    load().catch(() => {
      if (!canceled) setResult({ selection, posts: [], error: 'Could not load the Reddit feed.' })
    })
    return () => { canceled = true }
  }, [selection, enabled])

  const current = result?.selection === selection ? result : undefined
  return { current, isLoading: enabled && !current }
}
