// Check host permissions before allowing the user to sign in with a provider.
// as Firefox may block the Signin on v3 if the extension does not have host permissions.

const getChromeApi = (): any => {
  return (typeof window !== 'undefined' && (window as any).chrome) || null
}

export const checkHostPermissions = async () => {
  const chrome = getChromeApi()
  if (!chrome?.runtime) {
    return true
  }

  const HOST_PERMISSIONS = chrome.runtime.getManifest()?.content_scripts || []
  const requiredHosts = HOST_PERMISSIONS.flatMap((permission: any) => {
    return permission.matches || []
  })

  return await chrome.permissions.contains({ origins: requiredHosts })
}

export const requestHostPermissions = async () => {
  const chrome = getChromeApi()
  if (!chrome?.runtime) {
    return true
  }

  const HOST_PERMISSIONS = chrome.runtime.getManifest()?.content_scripts || []
  const requiredHosts = HOST_PERMISSIONS.flatMap((permission: any) => {
    return permission.matches || []
  })

  return await chrome.permissions.request({ origins: requiredHosts })
}
