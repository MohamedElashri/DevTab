import assert from 'node:assert/strict'
import test from 'node:test'
import { getRedditFeedItems } from '../src/features/cards/api/redditFeed.ts'

const rssItem = (url, publishedAt, title = 'Post') => ({
  id: `rss-${publishedAt}`,
  title,
  url,
  tags: [],
  published_at: publishedAt,
  source: 'feeds.example.com',
  comments_count: 0,
  points_count: 0,
  image_url: '',
})

const programming = rssItem('https://www.reddit.com/r/programming/comments/p1/post/', 100)
const technology = rssItem('https://www.reddit.com/r/technology/comments/t1/post/', 200)
const compsci = rssItem('https://www.reddit.com/r/CompSci/comments/c1/post/', 300)

test('a single subreddit feed keeps stable Reddit IDs and thread links', () => {
  const items = getRedditFeedItems([programming], [''])
  assert.deepEqual(items, [{
    ...programming,
    id: 'p1',
    canonical_url: programming.url,
    source: 'reddit',
    tags: ['programming'],
  }])
})

test('one feed can show all subreddits or just the selected topics', () => {
  const items = [programming, technology, compsci]
  assert.deepEqual(getRedditFeedItems(items, ['']).map((item) => item.tags[0]), [
    'programming', 'technology', 'compsci',
  ])
  assert.deepEqual(getRedditFeedItems(items, ['COMPSCI', 'programming']).map((item) => item.id), [
    'p1', 'c1',
  ])
  assert.deepEqual(getRedditFeedItems(items, ['javascript']), [])
})

test('duplicates are matched by Reddit post ID and the newest delivery wins', () => {
  const newest = rssItem('http://old.reddit.com/r/programming/comments/p1/post/?utm_source=test#top', 400, 'Updated')
  const items = getRedditFeedItems([programming, newest, programming], [])
  assert.equal(items.length, 1)
  assert.equal(items[0].id, 'p1')
  assert.equal(items[0].title, 'Updated')
  assert.equal(items[0].url, programming.url)
})

test('unsupported links and malformed entries are ignored', () => {
  const entries = [
    'not a URL',
    'https://reddit.com.example.org/r/programming/comments/p1/post/',
    'https://www.reddit.com/r/programming/',
    'ftp://www.reddit.com/r/programming/comments/p1/post/',
  ].map((url, index) => rssItem(url, index))
  assert.deepEqual(getRedditFeedItems(entries, []), [])
})
