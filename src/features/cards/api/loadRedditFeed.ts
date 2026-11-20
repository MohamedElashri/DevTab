import { getRssArticles, RssHttpError } from './getRssFeed'
import { loadDailyRedditFeed, RedditFeedFailure } from './redditDailyCache'
import { getRedditFeedItems, getRedlistenError, REDLISTEN_ORIGIN, type RedditFeedRequest } from './redditFeed'

export function loadRedditFeed(request: RedditFeedRequest) {
  const credential = request.authorization.slice('Bearer '.length)
  return loadDailyRedditFeed(request, async () => {
    try {
      const items = await getRssArticles(request.url, request.authorization)
      return getRedditFeedItems(items, request.subreddits).map((item) => ({ ...item, description: undefined }))
    } catch (error) {
      if (error instanceof RssHttpError) {
        const { message, retryAt } = await getRedlistenError(error.response)
        throw new RedditFeedFailure(message, retryAt)
      }
      throw error
    }
  }, { providerKey: `${REDLISTEN_ORIGIN}\n${credential}` })
}
