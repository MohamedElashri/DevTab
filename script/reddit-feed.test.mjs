import assert from 'node:assert/strict'
import test from 'node:test'
import {
  getRedditFeedItems,
  getRedditSubreddits,
  getRedlistenError,
  mergeRedditSubreddits,
  redlistenFeedRequest,
  resolveRedditFeedUrl,
} from '../src/features/cards/api/redditFeed.ts'
import { loadDailyRedditFeed, RedditFeedFailure, REDDIT_DAILY_REQUEST_LIMIT } from '../src/features/cards/api/redditDailyCache.ts'

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

test('subreddit templates support paths and query values without changing origin', () => {
  assert.deepEqual(getRedditSubreddits(['r/CompSci', 'compsci', 'c++', 'programming']), ['compsci', 'programming'])
  assert.equal(resolveRedditFeedUrl('https://feeds.example.com/{subreddit}/feed#section', 'compsci'), 'https://feeds.example.com/compsci/feed')
  assert.equal(resolveRedditFeedUrl('https://feeds.example.com/feed?sub={subreddit}', 'compsci'), 'https://feeds.example.com/feed?sub=compsci')
  assert.throws(() => resolveRedditFeedUrl('https://{subreddit}.example.com/feed', 'compsci'), /path or query/)
  assert.throws(() => resolveRedditFeedUrl('https://feeds.example.com/feed#{subreddit}', 'compsci'), /path or query/)
  assert.throws(() => resolveRedditFeedUrl('https://feeds.example.com/feed', '../other'), /Invalid subreddit/)
})

test('Redlisten requests contain the key only in the authorization header', () => {
  assert.deepEqual(redlistenFeedRequest('compsci', 'rl_live_fixture'), {
    url: 'https://api.redlisten.com/r/compsci/new.rss?limit=10',
    authorization: 'Bearer rl_live_fixture',
  })
})

test('merging gives each subreddit room before a busy feed fills the card', () => {
  const busy = [{ ...technology, id: 't1' }, { ...technology, id: 't2' }]
  assert.deepEqual(mergeRedditSubreddits([busy, [compsci]], 2).map((item) => item.id), [
    't1', compsci.id,
  ])
})

test('Redlisten key, plan, and service errors get distinct safe messages', async () => {
  const cases = [
    [401, /rejected this key/],
    [403, /denied access.*Check your plan/],
    [404, /find this subreddit/],
    [503, /Redlisten could not serve/],
  ]
  for (const [status, expected] of cases) {
    const response = Response.json({ error: { message: 'fixture-private-data' } }, { status })
    const { message } = await getRedlistenError(response)
    assert.match(message, expected)
    assert(!message.includes('fixture-private-data'))
  }
})

test('Redlisten quota errors identify the exhausted quota and honor Retry-After', async () => {
  const now = Date.parse('2026-11-20T12:00:00Z')
  const response = (code, headers) => Response.json({ error: { code } }, { status: 429, headers })
  const requests = await getRedlistenError(response('quota_exceeded', { 'retry-after': '7200' }), now)
  assert.match(requests.message, /monthly request quota/)
  assert.equal(requests.retryAt, now + 7_200_000)
  const results = await getRedlistenError(response('items_quota_exceeded'), now)
  assert.match(results.message, /monthly results quota/)
  assert.equal(results.retryAt, Date.parse('2026-12-01T00:00:00Z'))
  const concurrent = await getRedlistenError(response('too_many_in_flight', { 'retry-after': '2' }), now)
  assert.match(concurrent.message, /too many requests in progress/)
  assert.equal(concurrent.retryAt, now + 2000)
  const malformed = await getRedlistenError(new Response('upstream down', { status: 429 }), now)
  assert.match(malformed.message, /temporarily rate-limited/)
})

const day = 24 * 60 * 60 * 1000

const dailyFixture = () => {
  let time = Date.parse('2026-11-20T12:00:00Z')
  const values = new Map()
  const queues = new Map()
  const storage = {
    getItem: (key) => values.get(key) ?? null,
    setItem: (key, value) => values.set(key, value),
    removeItem: (key) => values.delete(key),
    key: (index) => [...values.keys()][index] ?? null,
    get length() { return values.size },
  }
  const locks = {
    request(name, task) {
      const result = (queues.get(name) ?? Promise.resolve()).then(task)
      queues.set(name, result.catch(() => {}))
      return result
    },
  }
  return { options: { storage, locks, now: () => time }, values, advance: (amount) => { time += amount } }
}

test('validation and concurrent readers share one request per rolling day', async () => {
  const { options, advance, values } = dailyFixture()
  const request = redlistenFeedRequest('programming', 'rl_live_fixture')
  let attempts = 0
  const load = async () => { attempts += 1; return [programming] }
  await Promise.all([loadDailyRedditFeed(request, load, options), loadDailyRedditFeed(request, load, options)])
  advance(day - 1)
  assert.deepEqual((await loadDailyRedditFeed(request, load, options)).posts, [programming])
  assert.equal(attempts, 1)
  assert(!JSON.stringify([...values]).includes('rl_live_fixture'))
  advance(1)
  await loadDailyRedditFeed(request, load, options)
  assert.equal(attempts, 2)
})

test('distinct feeds share a 20-request budget that resets at the next UTC day', async () => {
  const { options, advance } = dailyFixture()
  let attempts = 0
  const load = async () => { attempts += 1; return [] }
  const requests = Array.from({ length: REDDIT_DAILY_REQUEST_LIMIT + 1 }, (_, index) => ({
    url: `https://feeds.example.com/${index}`,
  }))
  const results = await Promise.all(requests.map((request) => loadDailyRedditFeed(request, load, options)))
  assert.equal(attempts, 20)
  assert.equal(results.filter((result) => result.error).length, 1)
  const skipped = requests[results.findIndex((result) => result.error)]
  advance(day / 2)
  await loadDailyRedditFeed(skipped, load, options)
  assert.equal(attempts, 21)
})

test('a failed refresh keeps cached posts and avoids immediate retries', async () => {
  const { options, advance } = dailyFixture()
  const request = redlistenFeedRequest('programming', 'rl_live_fixture')
  await loadDailyRedditFeed(request, async () => [programming], options)
  advance(day)
  const failed = await loadDailyRedditFeed(request, async () => { throw new Error('Failed to fetch feed: HTTP 429') }, options)
  assert.equal(failed.error, 'Failed to fetch feed: HTTP 429')
  assert.deepEqual(failed.posts, [programming])
  const cached = await loadDailyRedditFeed(request, async () => assert.fail('Retried too early'), options)
  assert.deepEqual(cached, failed)
})

test('a provider cooldown blocks other queued subreddits without spending their requests', async () => {
  const { options, advance, values } = dailyFixture()
  const providerKey = 'provider-fixture-key'
  const requests = ['programming', 'technology', 'compsci'].map((subreddit) => redlistenFeedRequest(subreddit, 'rl_live_fixture'))
  let attempts = 0
  const load = async () => {
    attempts += 1
    throw new RedditFeedFailure('Provider quota exhausted.', options.now() + 10 * day)
  }
  const held = await Promise.all(requests.map((request) => loadDailyRedditFeed(request, load, { ...options, providerKey })))
  assert.equal(attempts, 1)
  assert.deepEqual(held.map((result) => result.error), requests.map(() => 'Provider quota exhausted.'))
  assert(!JSON.stringify([...values]).includes(providerKey))
  advance(8 * day)
  await loadDailyRedditFeed({ url: 'https://other.example.com/feed' }, async () => [], options)
  await loadDailyRedditFeed(requests[1], load, { ...options, providerKey })
  assert.equal(attempts, 1)
  advance(2 * day)
  const recovered = await loadDailyRedditFeed(requests[1], async () => [technology], { ...options, providerKey })
  assert.deepEqual(recovered.posts, [technology])
})
