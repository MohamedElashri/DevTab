import { useQuery } from '@tanstack/react-query'
import { ExtractFnReturnType, QueryConfig } from 'src/lib/react-query'
import { Product } from 'src/types'
import { getRssArticles } from './getRssFeed'

const PRODUCT_HUNT_FEED_URL = 'https://www.producthunt.com/feed'

const stripHtml = (value?: string) => {
  if (!value) {
    return ''
  }

  return new DOMParser().parseFromString(value, 'text/html').body.textContent?.trim() || ''
}

const getFirstImage = (value?: string) => {
  if (!value) {
    return ''
  }

  const doc = new DOMParser().parseFromString(value, 'text/html')
  return doc.querySelector('img')?.getAttribute('src') || ''
}

const parseProductTitle = (rawTitle: string, description?: string) => {
  const cleanTitle = rawTitle.replace(/\s+\|\s*Product Hunt\s*$/i, '').trim()
  const [title, ...taglineParts] = cleanTitle.split(':')
  const tagline = taglineParts.join(':').trim() || stripHtml(description)

  return {
    title: title.trim() || cleanTitle,
    tagline,
  }
}

const getProducts = async (): Promise<Product[]> => {
  const articles = await getRssArticles(PRODUCT_HUNT_FEED_URL)

  return articles.map((article) => {
    const parsed = parseProductTitle(article.title, article.description)
    const imageUrl = getFirstImage(article.description)

    return {
      id: article.id,
      url: article.url,
      title: parsed.title,
      tags: article.tags,
      comments_count: 0,
      points_count: 0,
      image_url: imageUrl,
      published_at: article.published_at,
      description: article.description,
      tagline: parsed.tagline,
      votes_count: 0,
      topics: article.tags,
    }
  })
}

type QueryFnType = typeof getProducts

type UseGetProductsOptions = {
  config?: QueryConfig<QueryFnType>
}

export const useGetProductHuntProducts = ({ config }: UseGetProductsOptions = {}) => {
  return useQuery<ExtractFnReturnType<QueryFnType>>({
    ...config,
    queryKey: ['producthunt', PRODUCT_HUNT_FEED_URL],
    queryFn: getProducts,
  })
}
