import { getRssArticles } from './getRssFeed'
import { loadDailyRedditFeed } from './redditDailyCache'
import { getRedditFeedItems, type RedditFeedRequest } from './redditFeed'

export function loadRedditFeed(request: RedditFeedRequest) {
  return loadDailyRedditFeed(request, async () => {
    const items = await getRssArticles(request.url, request.authorization)
    return getRedditFeedItems(items, []).map((item) => ({ ...item, description: undefined }))
  })
}
