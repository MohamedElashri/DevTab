import { useQuery } from '@tanstack/react-query'
import { ExtractFnReturnType, QueryConfig } from 'src/lib/react-query'
import { Article } from 'src/types'
import { extensionFetch } from 'src/utils/extensionFetch'

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
    return (stories || []).map((s: any) => ({
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
    // Normalize tag to a potential subreddit name (remove spaces, lowercase)
    const rawTag = tags && tags.length > 0 && tags[0] ? tags[0] : ''
    const normalizedTag = rawTag.replace(/\s+/g, '').toLowerCase()

    // Only use a subreddit endpoint for clean single-word tags;
    // otherwise fall back to the global front-page feed.
    const url = normalizedTag && !rawTag.includes(' ')
      ? `https://www.reddit.com/r/${normalizedTag}/hot.json?limit=30`
      : 'https://www.reddit.com/.json?limit=30'

    const res = await extensionFetch(url)
    const data = await res.json()
    const posts = data?.data?.children || []
    return posts.map((p: any) => {
      const d = p.data
      return {
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
      }
    })
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
