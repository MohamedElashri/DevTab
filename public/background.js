// Cross-origin fetch proxy: Firefox background script / Chrome service worker.
// Some APIs (Lobsters, Reddit) don't send CORS headers. Extension pages
// can still fetch them via the background script because host_permissions
// allow cross-origin requests from privileged extension contexts.

const PROXY_TIMEOUT_MS = 15000

chrome.runtime.onMessage.addListener((request, _sender, sendResponse) => {
  if (request.type !== 'PROXY_FETCH') {
    return false
  }

  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), PROXY_TIMEOUT_MS)

  const promise = fetch(request.url, {
    method: request.method || 'GET',
    headers: request.headers || {},
    signal: controller.signal,
  })
    .then(async (res) => {
      const contentType = res.headers.get('content-type') || ''
      const text = await res.text()
      let data
      if (contentType.includes('application/json')) {
        try {
          data = JSON.parse(text)
        } catch {
          data = text
        }
      } else {
        data = text
      }
      return {
        ok: res.ok,
        status: res.status,
        contentType,
        data,
      }
    })
    .catch((err) => {
      const errMsg = err?.message || String(err)
      console.error('[DevTab BG Proxy] fetch failed:', request.url, errMsg, err?.name || '')
      return {
        ok: false,
        status: 0,
        error: errMsg,
      }
    })
    .finally(() => clearTimeout(timeoutId))

  // Preserve Firefox's Promise response; Chrome's callback form also works on
  // versions where Promise-returning listeners are not supported.
  if (typeof browser !== 'undefined' && browser.runtime) {
    return promise
  }
  promise.then(sendResponse)
  return true
})

