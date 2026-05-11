export const getAppVersion = (): string | undefined => {
  try {
    const manifestData = (window as any).chrome?.runtime?.getManifest?.()
    return manifestData?.version
  } catch (e) {
    return undefined
  }
}
