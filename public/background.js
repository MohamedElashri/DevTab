// Background script proxy for cross-origin fetches in Firefox MV3
// Some APIs (Lobsters, Reddit) don't send CORS headers. Extension pages
// can still fetch them via the background script because host_permissions
// allow cross-origin requests from privileged extension contexts.

const PROXY_TIMEOUT_MS = 15000

chrome.runtime.onMessage.addListener((request, _sender) => {
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
      clearTimeout(timeoutId)
      const contentType = res.headers.get('content-type') || ''
      let data
      if (contentType.includes('application/json')) {
        data = await res.json()
      } else {
        data = await res.text()
      }
      return {
        ok: res.ok,
        status: res.status,
        data,
      }
    })
    .catch((err) => {
      clearTimeout(timeoutId)
      const errMsg = err?.message || String(err)
      console.error('[Hackertab BG Proxy] fetch failed:', request.url, errMsg, err?.name || '')
      return {
        ok: false,
        status: 0,
        error: errMsg,
      }
    })

  // Returning a Promise from the listener sends the resolved value as the response.
  // This is more reliable in Firefox than using sendResponse + return true.
  return promise
})

try {
  if (chrome.runtime.setUninstallURL) {
    chrome.runtime.setUninstallURL('https://github.com/medyo/hackertab.dev')
  }
} catch (e) {
  // Ignore
}
