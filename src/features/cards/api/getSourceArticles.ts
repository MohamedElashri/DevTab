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

const parseRedditAtomFeed = (xmlText: string): Article[] => {
  try {
    const doc = new DOMParser().parseFromString(xmlText, 'text/xml')
    const entries = Array.from(doc.querySelectorAll('entry'))
    return entries.map((entry, index) => {
      const rawId = entry.querySelector('id')?.textContent?.trim() || ''
      const id = rawId.replace(/^t3_/, '') || `reddit-${index}`
      const linkElem = entry.querySelector('link')
      const canonicalUrl = linkElem?.getAttribute('href') || ''
      const title = entry.querySelector('title')?.textContent?.trim() || 'Untitled'
      const category = entry.querySelector('category')
      const subreddit =
        category?.getAttribute('term') ||
        category?.getAttribute('label')?.replace(/^r\//, '') ||
        'reddit'
      const published =
        entry.querySelector('published')?.textContent ||
        entry.querySelector('updated')?.textContent
      const publishedAt = published ? new Date(published).getTime() : Date.now()

      const content = entry.querySelector('content')?.textContent || ''
      const linkMatch = content.match(/<a\s+href="([^"]+)">\[link\]<\/a>/i)
      const url = linkMatch && linkMatch[1] ? linkMatch[1] : canonicalUrl

      const thumbnailElem = entry.querySelector('thumbnail')
      const mediaThumbnail = thumbnailElem?.getAttribute('url')
      const imgMatch = content.match(/<img\s+src="([^"]+)"/i)
      const imageUrl = mediaThumbnail || (imgMatch ? imgMatch[1] : '')

      return {
        id,
        url: url || canonicalUrl,
        title,
        tags: [subreddit],
        comments_count: 0,
        points_count: 0,
        image_url: imageUrl && imageUrl.startsWith('http') ? imageUrl : '',
        published_at: Number.isNaN(publishedAt) ? Date.now() : publishedAt,
        description: '',
        source: 'reddit',
        canonical_url: canonicalUrl,
      }
    })
  } catch {
    return []
  }
}

const mapRedditJsonPosts = (children: RedditPost[]): Article[] => {
  return children.map(({ data: d }) => ({
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

const fetchRedditArticles = async (subreddits: string[]): Promise<Article[]> => {
  const subPath = subreddits.join('+')

  // 1. Try combined JSON endpoint
  try {
    const jsonUrl = `https://www.reddit.com/r/${subPath}/hot.json?limit=30`
    const res = await extensionFetch(jsonUrl, {
      headers: {
        accept: 'application/json, text/plain, */*',
      },
    })
    if (res.ok) {
      const contentType = res.headers.get('content-type') || ''
      if (contentType.includes('application/json')) {
        const data = await res.json()
        const children: RedditPost[] = data?.data?.children || []
        if (Array.isArray(children) && children.length > 0) {
          const mapped = mapRedditJsonPosts(children)
          if (mapped.length > 0) return mapped
        }
      }
    }
  } catch {
    // Continue to RSS fallback
  }

  // 2. Fallback: try combined RSS/Atom endpoint
  try {
    const rssUrl = `https://www.reddit.com/r/${subPath}/hot.rss`
    const res = await extensionFetch(rssUrl, {
      headers: {
        accept: 'application/atom+xml, application/rss+xml, application/xml, text/xml, */*',
      },
    })
    if (res.ok) {
      const text = await res.text()
      const articles = parseRedditAtomFeed(text)
      if (articles.length > 0) {
        return articles
      }
    }
  } catch {
    // Continue to individual subreddits fallback
  }

  // 3. Fallback: if multi-subreddit failed and multiple subreddits exist, try individual subreddits
  for (const sub of subreddits) {
    try {
      const jsonUrl = `https://www.reddit.com/r/${sub}/hot.json?limit=30`
      const res = await extensionFetch(jsonUrl, {
        headers: { accept: 'application/json, text/plain, */*' },
      })
      if (res.ok) {
        const contentType = res.headers.get('content-type') || ''
        if (contentType.includes('application/json')) {
          const data = await res.json()
          const children: RedditPost[] = data?.data?.children || []
          if (Array.isArray(children) && children.length > 0) {
            const mapped = mapRedditJsonPosts(children)
            if (mapped.length > 0) return mapped
          }
        }
      }
    } catch {
      // Continue
    }

    try {
      const rssUrl = `https://www.reddit.com/r/${sub}/hot.rss`
      const res = await extensionFetch(rssUrl, {
        headers: {
          accept: 'application/atom+xml, application/rss+xml, application/xml, text/xml, */*',
        },
      })
      if (res.ok) {
        const text = await res.text()
        const articles = parseRedditAtomFeed(text)
        if (articles.length > 0) {
          return articles
        }
      }
    } catch {
      continue
    }
  }

  throw new Error('Unable to load Reddit posts. Reddit may be rate-limiting requests; please try again in a few moments.')
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

    return fetchRedditArticles(subreddits)
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
