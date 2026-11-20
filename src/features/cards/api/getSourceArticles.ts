import { ExtractFnReturnType, QueryConfig, useQuery } from 'src/lib/react-query'
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

const getArticles = async (source: string): Promise<Article[]> => {
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

  return []
}

type QueryFnType = typeof getArticles

type UseGetArticlesOptions = {
  config?: QueryConfig<QueryFnType>
  source: string
}

export const useGetSourceArticles = ({ config, source }: UseGetArticlesOptions) => {
  return useQuery<ExtractFnReturnType<QueryFnType>>({
    ...config,
    queryKey: [source],
    queryFn: () => getArticles(source),
  })
}
