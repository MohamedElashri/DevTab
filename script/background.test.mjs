import assert from 'node:assert/strict'
import fs from 'node:fs'
import test from 'node:test'
import vm from 'node:vm'

const source = fs.readFileSync(new URL('../public/background.js', import.meta.url), 'utf8')

function loadBackground({ firefox = false, fetchImpl = async () => new Response('{"items":[1]}', {
  headers: { 'content-type': 'application/json' },
}) } = {}) {
  let listener
  let fetchCalls = 0
  const runtime = { onMessage: { addListener: (fn) => { listener = fn } } }
  vm.runInNewContext(source, {
    chrome: { runtime },
    ...(firefox ? { browser: { runtime } } : {}),
    fetch: (...args) => { fetchCalls += 1; return fetchImpl(...args) },
    AbortController,
    setTimeout,
    clearTimeout,
    console: { error() {} },
  })
  return { listener, get fetchCalls() { return fetchCalls } }
}

test('Chrome keeps the channel open and sends the asynchronous fetch response', async () => {
  let resolveFetch
  const background = loadBackground({ fetchImpl: () => new Promise((resolve) => { resolveFetch = resolve }) })
  let respond
  const response = new Promise((resolve) => { respond = resolve })
  assert.equal(background.listener({ type: 'PROXY_FETCH', url: 'https://lobste.rs/hottest.json' }, {}, respond), true)
  resolveFetch(new Response('{"items":[1]}', { headers: { 'content-type': 'application/json' } }))
  const result = await response
  assert.equal(result.ok, true)
  assert.equal(result.status, 200)
  assert.equal(JSON.stringify(result.data), '{"items":[1]}')
})

test('Firefox still returns a Promise and does not use the callback response', async () => {
  const background = loadBackground({ firefox: true })
  const pending = background.listener({ type: 'PROXY_FETCH', url: 'https://lobste.rs/hottest.json' }, {}, () => assert.fail('Unexpected callback'))
  assert.equal(typeof pending.then, 'function')
  const result = await pending
  assert.equal(result.status, 200)
  assert.equal(JSON.stringify(result.data), '{"items":[1]}')
})

test('unrelated messages do not fetch or claim a response channel', () => {
  for (const firefox of [false, true]) {
    const background = loadBackground({ firefox })
    assert.equal(background.listener({ type: 'OTHER' }, {}, () => assert.fail('Unexpected callback')), false)
    assert.equal(background.fetchCalls, 0)
  }
})

test('network failures reach callers in both browsers', async () => {
  for (const firefox of [false, true]) {
    const background = loadBackground({ firefox, fetchImpl: async () => { throw new Error('Network unavailable') } })
    let respond
    const callbackResponse = new Promise((resolve) => { respond = resolve })
    const pending = background.listener({ type: 'PROXY_FETCH', url: 'https://lobste.rs/hottest.json' }, {}, respond)
    const result = await (firefox ? pending : callbackResponse)
    assert.equal(result.ok, false)
    assert.equal(result.status, 0)
    assert.equal(result.error, 'Network unavailable')
  }
})

test('RSS text and HTTP failures retain their body and status in Chrome', async () => {
  const background = loadBackground({ fetchImpl: async () => new Response('<error>missing</error>', {
    status: 404, headers: { 'content-type': 'application/xml' },
  }) })
  let respond
  const response = new Promise((resolve) => { respond = resolve })
  background.listener({ type: 'PROXY_FETCH', url: 'https://example.com/feed' }, {}, respond)
  const result = await response
  assert.equal(result.ok, false)
  assert.equal(result.status, 404)
  assert.equal(result.contentType, 'application/xml')
  assert.equal(result.data, '<error>missing</error>')
})
