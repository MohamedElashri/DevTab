/**
 * Fetch wrapper that routes cross-origin requests through the extension
 * background script when running inside a Firefox/Chrome extension.
 *
 * Some APIs (Lobsters, Reddit) don't send CORS headers. In an extension
 * context the background script is allowed to fetch those origins thanks
 * to host_permissions, so we proxy the request when needed.
 */

const isExtensionContext = (): boolean => {
  if (typeof window === 'undefined') return false
  const w = window as any
  return Boolean(w.chrome?.runtime?.id || w.browser?.runtime?.id)
}

export async function extensionFetch(url: string, init?: RequestInit): Promise<Response> {
  if (!isExtensionContext()) {
    // Normal web context – just fetch directly
    return fetch(url, init)
  }

  const w = window as any
  const runtime = w.chrome?.runtime || w.browser?.runtime
  if (!runtime?.sendMessage) {
    throw new Error('Extension runtime API not available')
  }

  // Convert Headers object to plain record if needed
  let headers: Record<string, string> | undefined
  if (init?.headers) {
    if (init.headers instanceof Headers) {
      headers = {}
      init.headers.forEach((value, key) => {
        headers![key] = value
      })
    } else if (Array.isArray(init.headers)) {
      headers = Object.fromEntries(init.headers)
    } else {
      headers = init.headers as Record<string, string>
    }
  }

  // Firefox supports Promise-based sendMessage when no callback is provided.
  const result = await runtime.sendMessage({
    type: 'PROXY_FETCH',
    url,
    method: init?.method || 'GET',
    headers,
  })

  if (!result) {
    throw new Error('No response from background script')
  }
  if (!result.ok) {
    throw new Error(result.error || `HTTP ${result.status}`)
  }

  // Reconstruct a Response-like object so callers can use .json() / .text()
  const body =
    typeof result.data === 'string' ? result.data : JSON.stringify(result.data)
  return new Response(body, {
    status: result.status,
    statusText: result.ok ? 'OK' : 'Error',
    headers: {
      'content-type':
        typeof result.data === 'object'
          ? 'application/json'
          : 'text/plain',
    },
  })
}
