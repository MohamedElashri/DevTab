import { getRssArticles, RssHttpError } from './getRssFeed'
import { loadDailyRedditFeed, RedditFeedFailure } from './redditDailyCache'
import { getRedditFeedItems, getRedlistenError, REDLISTEN_ORIGIN, type RedditFeedRequest } from './redditFeed'

export function loadRedditFeed(request: RedditFeedRequest) {
  const url = new URL(request.url)
  const redlisten = url.origin === REDLISTEN_ORIGIN
  const credential = redlisten
    ? request.authorization?.replace(/^Bearer /i, '') || url.searchParams.get('key') || undefined
    : undefined

  return loadDailyRedditFeed(request, async () => {
    try {
      const items = await getRssArticles(request.url, request.authorization)
      return getRedditFeedItems(items, []).map((item) => ({ ...item, description: undefined }))
    } catch (error) {
      if (redlisten && error instanceof RssHttpError) {
        const { message, retryAt } = await getRedlistenError(error.response)
        throw new RedditFeedFailure(message, retryAt)
      }
      throw error
    }
  }, { providerKey: credential ? `${url.origin}\n${credential}` : undefined })
}
