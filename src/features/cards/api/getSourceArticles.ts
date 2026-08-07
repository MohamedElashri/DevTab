import { useQuery } from '@tanstack/react-query'
import { ExtractFnReturnType, QueryConfig } from 'src/lib/react-query'
import { Article } from 'src/types'
import { extensionFetch } from 'src/utils/extensionFetch'

type LobstersStory = {
  short_id: string
  url: string
  title: string
  tags: string[]
  comment_count: number
  score: number
  created_at: string
}

type RedditPost = {
  data: {
    id: string
    url: string
    permalink: string
    title: string
    subreddit: string
    num_comments: number
    score: number
    thumbnail: string
    created_utc: number
  }
}

const getArticles = async ({
  source,
  tags,
}: {
  source: string
  tags?: string[]
}): Promise<Article[]> => {
  if (source === 'hackernews') {
    const idsRes = await fetch('https://hacker-news.firebaseio.com/v0/topstories.json')
    const ids: number[] = await idsRes.json()
    const topIds = ids.slice(0, 30)
    const stories = await Promise.all(
      topIds.map(async (id) => {
        const res = await fetch(`https://hacker-news.firebaseio.com/v0/item/${id}.json`)
        return res.json()
      })
    )
    return stories
      .filter((s) => s && s.title)
      .map((s) => ({
        id: String(s.id),
        url: s.url || `https://news.ycombinator.com/item?id=${s.id}`,
        title: s.title,
        tags: [],
        comments_count: s.descendants || 0,
        points_count: s.score || 0,
        image_url: '',
        published_at: (s.time || 0) * 1000,
        description: '',
        source: 'hackernews',
        canonical_url: `https://news.ycombinator.com/item?id=${s.id}`,
      }))
  }

  if (source === 'lobsters') {
    const res = await extensionFetch('https://lobste.rs/hottest.json')
    const stories = await res.json()
    return (stories || []).map((s: LobstersStory) => ({
      id: String(s.short_id),
      url: s.url || `https://lobste.rs/s/${s.short_id}`,
      title: s.title,
      tags: s.tags || [],
      comments_count: s.comment_count || 0,
      points_count: s.score || 0,
      image_url: '',
      published_at: new Date(s.created_at).getTime(),
      description: '',
      source: 'lobsters',
      canonical_url: `https://lobste.rs/s/${s.short_id}`,
    }))
  }

  if (source === 'reddit') {
    const DEFAULT_TECH_SUBREDDITS = ['programming', 'technology', 'compsci']

    const rawTags = tags && tags.length > 0 ? tags.filter((t) => t && t.trim() !== '') : []

    const subreddits = rawTags.length > 0
      ? rawTags.map((t) => t.replace(/\s+/g, '').toLowerCase())
      : DEFAULT_TECH_SUBREDDITS

    const urls = subreddits.map((sub) =>
      `https://www.reddit.com/r/${sub}/hot.json?limit=30`
    )

    const results = await Promise.allSettled(
      urls.map(async (url) => {
        const res = await extensionFetch(url)
        const data = await res.json()
        return data?.data?.children || []
      })
    )

    const posts = results
      .filter((r): r is PromiseFulfilledResult<RedditPost[]> => r.status === 'fulfilled')
      .flatMap((r) => r.value)

    const seen = new Set<string>()
    const uniquePosts = posts.filter((p: RedditPost) => {
      if (seen.has(p.data.id)) return false
      seen.add(p.data.id)
      return true
    })

    const sorted = uniquePosts
      .map((p: RedditPost) => ({
        data: p.data,
        score: p.data.score || 0,
      }))
      .sort((a, b) => b.score - a.score)
      .slice(0, 30)

    return sorted.map(({ data: d }) => ({
      id: d.id,
      url: d.url || `https://www.reddit.com${d.permalink}`,
      title: d.title,
      tags: [d.subreddit],
      comments_count: d.num_comments || 0,
      points_count: d.score || 0,
      image_url: d.thumbnail && d.thumbnail.startsWith('http') ? d.thumbnail : '',
      published_at: d.created_utc ? d.created_utc * 1000 : Date.now(),
      description: '',
      source: 'reddit',
      canonical_url: `https://www.reddit.com${d.permalink}`,
    }))
  }

  return []
}

type QueryFnType = typeof getArticles

type UseGetArticlesOptions = {
  config?: QueryConfig<QueryFnType>
  source: string
  tags?: string[]
}

export const useGetSourceArticles = ({ config, source, tags }: UseGetArticlesOptions) => {
  return useQuery<ExtractFnReturnType<QueryFnType>>({
    ...config,
    queryKey: [source, ...(tags || [])],
    queryFn: () => getArticles({ source, tags }),
  })
}
