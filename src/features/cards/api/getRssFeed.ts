import { useQuery } from '@tanstack/react-query'
import { ExtractFnReturnType, QueryConfig } from 'src/lib/react-query'
import { Article } from 'src/types'
import { extensionFetch } from 'src/utils/extensionFetch'

type RssInfoType = {
  title: string
  link: string
  icon?: string
}

const getParserError = (doc: Document) => doc.querySelector('parsererror')?.textContent

const getDirectChild = (node: Element, names: string[]) => {
  const normalizedNames = names.map((name) => name.toLowerCase())
  return Array.from(node.children).find((child) =>
    normalizedNames.includes(child.localName.toLowerCase())
  )
}

const getDirectChildText = (node: Element, names: string[]) => {
  return getDirectChild(node, names)?.textContent?.trim() || ''
}

const getFirstText = (node: ParentNode, selectors: string[]) => {
  for (const selector of selectors) {
    const value = node.querySelector(selector)?.textContent?.trim()
    if (value) {
      return value
    }
  }
  return ''
}

const resolveUrl = (url: string, baseUrl: string) => {
  if (!url) {
    return ''
  }

  try {
    return new URL(url, baseUrl).toString()
  } catch {
    return url
  }
}

const getAtomLink = (entry: Element, feedUrl: string) => {
  const links = Array.from(entry.children).filter(
    (child) => child.localName.toLowerCase() === 'link'
  )
  const preferred =
    links.find((link) => ['alternate', ''].includes(link.getAttribute('rel') || '')) || links[0]

  return resolveUrl(
    preferred?.getAttribute('href') || preferred?.textContent?.trim() || '',
    feedUrl
  )
}

const getFeedTitle = (doc: Document) => {
  return getFirstText(doc, ['channel > title', 'feed > title']) || 'RSS Feed'
}

const getFeedLink = (doc: Document, feedUrl: string) => {
  const rssLink = getFirstText(doc, ['channel > link'])
  if (rssLink) {
    return resolveUrl(rssLink, feedUrl)
  }

  const atomFeed = doc.querySelector('feed')
  if (atomFeed) {
    return getAtomLink(atomFeed, feedUrl) || feedUrl
  }

  return feedUrl
}

const getFeedIcon = (doc: Document, feedUrl: string) => {
  const rssImage = getFirstText(doc, ['channel > image > url'])
  if (rssImage) {
    return resolveUrl(rssImage, feedUrl)
  }

  const atomIcon = getFirstText(doc, ['feed > icon', 'feed > logo'])
  if (atomIcon) {
    return resolveUrl(atomIcon, feedUrl)
  }

  const itunesImage = doc.querySelector('channel > image[href], feed > image[href]')
  return resolveUrl(itunesImage?.getAttribute('href') || '', feedUrl) || undefined
}

const getFeedDocument = async (feedUrl: string) => {
  const res = await extensionFetch(feedUrl, {
    headers: {
      accept: 'application/rss+xml, application/atom+xml, application/xml, text/xml, */*',
    },
  })
  const text = await res.text()
  const doc = new DOMParser().parseFromString(text, 'text/xml')
  const parserError = getParserError(doc)

  if (parserError) {
    throw new Error('This URL did not return a valid RSS or Atom feed.')
  }

  return doc
}

export const getRssUrlFeed = async (rssUrl: string): Promise<RssInfoType> => {
  const doc = await getFeedDocument(rssUrl)

  return {
    title: getFeedTitle(doc),
    link: getFeedLink(doc, rssUrl),
    icon: getFeedIcon(doc, rssUrl),
  }
}

const getPublishedAt = (item: Element) => {
  const rawDate = getDirectChildText(item, ['pubDate', 'published', 'updated', 'date'])
  const timestamp = rawDate ? new Date(rawDate).getTime() : NaN
  return Number.isNaN(timestamp) ? Date.now() : timestamp
}

const parseRssItem = (item: Element, feedUrl: string, index: number): Article => {
  const link = resolveUrl(getDirectChildText(item, ['link']), feedUrl)
  const guid = getDirectChildText(item, ['guid'])
  const publishedAt = getPublishedAt(item)

  return {
    id: guid || link || `${feedUrl}-${index}`,
    url: link,
    title: getDirectChildText(item, ['title']) || link || 'Untitled',
    tags: Array.from(item.children)
      .filter((child) => child.localName.toLowerCase() === 'category')
      .map((child) => child.textContent?.trim())
      .filter(Boolean) as string[],
    comments_count: 0,
    points_count: 0,
    image_url: '',
    published_at: publishedAt,
    description: getDirectChildText(item, ['description', 'summary']),
    source: new URL(feedUrl).hostname,
    canonical_url: link,
  }
}

const parseAtomEntry = (entry: Element, feedUrl: string, index: number): Article => {
  const link = getAtomLink(entry, feedUrl)
  const publishedAt = getPublishedAt(entry)

  return {
    id: getDirectChildText(entry, ['id']) || link || `${feedUrl}-${index}`,
    url: link,
    title: getDirectChildText(entry, ['title']) || link || 'Untitled',
    tags: Array.from(entry.children)
      .filter((child) => child.localName.toLowerCase() === 'category')
      .map((child) => child.getAttribute('term') || child.textContent?.trim())
      .filter(Boolean) as string[],
    comments_count: 0,
    points_count: 0,
    image_url: '',
    published_at: publishedAt,
    description: getDirectChildText(entry, ['summary', 'content']),
    source: new URL(feedUrl).hostname,
    canonical_url: link,
  }
}

export const getRssArticles = async (feedUrl: string): Promise<Article[]> => {
  const doc = await getFeedDocument(feedUrl)
  const rssItems = Array.from(doc.querySelectorAll('channel > item'))
  const atomEntries = Array.from(doc.querySelectorAll('feed > entry'))

  if (rssItems.length > 0) {
    return rssItems.map((item, index) => parseRssItem(item, feedUrl, index))
  }

  return atomEntries.map((entry, index) => parseAtomEntry(entry, feedUrl, index))
}

type QueryFnType = typeof getRssArticles

type UseGetArticlesOptions = {
  config?: QueryConfig<QueryFnType>
  feedUrl: string
}

export const useRssFeed = ({ feedUrl, config }: UseGetArticlesOptions) => {
  return useQuery<ExtractFnReturnType<QueryFnType>>({
    ...config,
    queryKey: ['rss', feedUrl],
    queryFn: () => getRssArticles(feedUrl),
  })
}
