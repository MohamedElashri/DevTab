/**
 * Extension host-permission helpers.
 *
 * In Firefox MV3, host_permissions are optional by default and not
 * auto-granted for temporary extensions.  `permissions.request()` can only
 * be called from a user-input handler, so we expose a helper to be invoked
 * from a button click instead of on page load.
 */

const HOST_ORIGINS = [
  'https://api.github.com/*',
  'https://hacker-news.firebaseio.com/*',
  'https://lobste.rs/*',
  'https://www.reddit.com/*',
]

function getPermissionsApi() {
  if (typeof window === 'undefined') return null
  const w = window as any
  return w.chrome?.permissions || w.browser?.permissions || null
}

function getRuntime() {
  if (typeof window === 'undefined') return null
  const w = window as any
  return w.chrome?.runtime || w.browser?.runtime || null
}

export async function hasExtensionPermissions(): Promise<boolean> {
  const permissionsApi = getPermissionsApi()
  const runtime = getRuntime()
  if (!permissionsApi || !runtime?.id) return false

  return new Promise<boolean>((resolve) => {
    permissionsApi.contains({ origins: HOST_ORIGINS }, (result: boolean) => {
      if (runtime.lastError) {
        console.warn('[Hackertab] permissions.contains error:', runtime.lastError.message)
        resolve(false)
        return
      }
      resolve(result)
    })
  })
}

/**
 * Call this from a button click / user-input handler.
 * Firefox rejects permissions.request() if it isn't triggered by user input.
 */
export async function requestExtensionPermissions(): Promise<boolean> {
  const permissionsApi = getPermissionsApi()
  const runtime = getRuntime()
  if (!permissionsApi || !runtime?.id) {
    console.warn('[Hackertab] permissions API not available')
    return false
  }

  return new Promise<boolean>((resolve) => {
    permissionsApi.request({ origins: HOST_ORIGINS }, (result: boolean) => {
      if (runtime.lastError) {
        console.warn('[Hackertab] permissions.request error:', runtime.lastError.message)
        resolve(false)
        return
      }
      console.log('[Hackertab] host permissions granted:', result)
      resolve(result)
    })
  })
}
