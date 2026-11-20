import { useEffect, useMemo, useState } from 'react'
import type { Article } from 'src/types'
import { loadRedditFeed } from '../api/loadRedditFeed'
import { redlistenFeedRequest } from '../api/redditFeed'

export function useRedditFeed(key: string | undefined, topics: string[], postLimit: number, enabled: boolean) {
  const request = useMemo(
    () => key ? redlistenFeedRequest(topics, key, postLimit) : undefined,
    [key, topics, postLimit]
  )
  const [result, setResult] = useState<{
    request: typeof request
    posts: Article[]
    error?: string
    partial?: boolean
  }>()

  useEffect(() => {
    if (!enabled || !request) return
    let canceled = false
    const load = async () => {
      const { posts = [], error } = await loadRedditFeed(request)
      if (!canceled) setResult({ request, posts, error, partial: Boolean(error && posts.length) })
    }
    load().catch(() => {
      if (!canceled) setResult({ request, posts: [], error: 'Could not load the Reddit feed.' })
    })
    return () => { canceled = true }
  }, [request, enabled])

  const current = result?.request === request ? result : undefined
  return { current, isLoading: enabled && Boolean(request) && !current }
}
