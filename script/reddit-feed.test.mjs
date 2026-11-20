import assert from 'node:assert/strict'
import test from 'node:test'
import {
  getRedditFeedItems,
  getRedlistenError,
  parseRedlistenKey,
  redlistenFeedRequest,
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

test('My Stack builds one stable feed URL from normalized topics', () => {
  const key = 'rl_live_fixture'
  const request = redlistenFeedRequest(['JavaScript', 'r/CompSci', 'compsci', 'c++', 'Machine Learning', '../other'], key)
  assert.deepEqual(request, {
    url: 'https://api.redlisten.com/r/compsci+cpp+javascript+machinelearning/new.rss?limit=25',
    authorization: 'Bearer rl_live_fixture',
    subreddits: ['compsci', 'cpp', 'javascript', 'machinelearning'],
  })
  assert.deepEqual(request, redlistenFeedRequest(['machinelearning', 'compsci', 'cpp', 'javascript'], key))
})

test('Redlisten requests contain the key only in the authorization header', () => {
  assert.deepEqual(redlistenFeedRequest(['compsci'], 'rl_live_fixture'), {
    url: 'https://api.redlisten.com/r/compsci/new.rss?limit=25',
    authorization: 'Bearer rl_live_fixture',
    subreddits: ['compsci'],
  })
})

test('the post limit applies to the combined feed and falls back to 25 for unsupported values', () => {
  for (const limit of [10, 25, 50, 100, NaN]) {
    const request = redlistenFeedRequest(['python', 'rust'], 'rl_live_fixture', limit)
    const expected = limit === 10 || limit === 50 ? limit : 25
    assert.equal(request.url, `https://api.redlisten.com/r/python+rust/new.rss?limit=${expected}`)
  }
})

test('Redlisten accepts raw keys and common copy formats without requiring a fixed prefix', () => {
  const key = 'fixture.Abc+DEF/ghi=='
  assert.equal(parseRedlistenKey('  rl_live_fixture  '), 'rl_live_fixture')
  for (const input of [
    key,
    `"${key}"`,
    `Bearer ${key}`,
    `Authorization: Bearer ${key}`,
    `https://api.redlisten.com/r/compsci/new.rss?key=${encodeURIComponent(key)}`,
  ]) {
    assert.equal(parseRedlistenKey(input), key)
  }
})

test('Redlisten rejects incomplete entries, other hosts, and malformed bearer tokens', () => {
  for (const input of [
    '',
    'rl_live_…',
    'https://[',
    'https://api.redlisten.com/r/compsci/new.rss',
    'https://api.redlisten.com.example.org/r/compsci/new.rss?key=fixture',
    'https://api.redlisten.com@another.example.org/?key=fixture',
    'Bearer key\nX-Foo: value',
  ]) {
    assert.equal(parseRedlistenKey(input), undefined)
  }
})

test('Tech and an empty stack use the same default feed', () => {
  const request = redlistenFeedRequest([], 'rl_live_fixture')
  assert.equal(request.url, 'https://api.redlisten.com/r/compsci+programming+technology/new.rss?limit=25')
  assert.deepEqual(redlistenFeedRequest([''], 'rl_live_fixture'), request)
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
  const key = 'rl_live_fixture'
  const request = redlistenFeedRequest(['technology', 'programming'], key)
  const reordered = redlistenFeedRequest(['programming', 'technology'], key)
  let attempts = 0
  const load = async () => { attempts += 1; return [programming] }
  await Promise.all([loadDailyRedditFeed(request, load, options), loadDailyRedditFeed(reordered, load, options)])
  advance(day - 1)
  assert.deepEqual((await loadDailyRedditFeed(request, load, options)).posts, [programming])
  assert.equal(attempts, 1)
  assert(!JSON.stringify([...values]).includes('rl_live_fixture'))
  advance(1)
  await loadDailyRedditFeed(request, load, options)
  assert.equal(attempts, 2)
})

test('switching post limits preserves each feed in the daily cache', async () => {
  const { options } = dailyFixture()
  const key = 'rl_live_fixture'
  const topics = ['programming', 'technology']
  const defaultRequest = redlistenFeedRequest(topics, key)
  const largerRequest = redlistenFeedRequest(topics, key, 50)
  await loadDailyRedditFeed(defaultRequest, async () => [programming], options)
  await loadDailyRedditFeed(largerRequest, async () => [programming, technology], options)
  const cached = async () => assert.fail('Cached feed was fetched again')
  assert.deepEqual((await loadDailyRedditFeed(defaultRequest, cached, options)).posts, [programming])
  assert.deepEqual((await loadDailyRedditFeed(largerRequest, cached, options)).posts, [programming, technology])
})

test('distinct feeds share a 20-request budget that resets at the next UTC day', async () => {
  const { options, advance } = dailyFixture()
  let attempts = 0
  const load = async () => { attempts += 1; return [] }
  const requests = Array.from({ length: REDDIT_DAILY_REQUEST_LIMIT + 1 }, (_, index) =>
    redlistenFeedRequest([`topic${index}`], 'rl_live_fixture')
  )
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
  const request = redlistenFeedRequest(['programming'], 'rl_live_fixture')
  await loadDailyRedditFeed(request, async () => [programming], options)
  advance(day)
  const failed = await loadDailyRedditFeed(request, async () => { throw new Error('Failed to fetch feed: HTTP 429') }, options)
  assert.equal(failed.error, 'Failed to fetch feed: HTTP 429')
  assert.deepEqual(failed.posts, [programming])
  const cached = await loadDailyRedditFeed(request, async () => assert.fail('Retried too early'), options)
  assert.deepEqual(cached, failed)
})

test('a provider cooldown blocks other queued views without spending their requests', async () => {
  const { options, advance, values } = dailyFixture()
  const providerKey = 'provider-fixture-key'
  const requests = [['programming'], ['technology'], []].map((topics) => redlistenFeedRequest(topics, 'rl_live_fixture'))
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
  await loadDailyRedditFeed(redlistenFeedRequest(['python'], 'rl_live_other_fixture'), async () => [], options)
  await loadDailyRedditFeed(requests[1], load, { ...options, providerKey })
  assert.equal(attempts, 1)
  advance(2 * day)
  const recovered = await loadDailyRedditFeed(requests[1], async () => [technology], { ...options, providerKey })
  assert.deepEqual(recovered.posts, [technology])
})
