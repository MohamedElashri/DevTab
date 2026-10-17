import { useSyncExternalStore } from 'react'

export type MediaQueryOptions = string | { minWidth?: number; maxWidth?: number }

function toQueryString(options: MediaQueryOptions): string {
  if (typeof options === 'string') return options
  const parts: string[] = []
  if (options.minWidth !== undefined) parts.push(`(min-width: ${options.minWidth}px)`)
  if (options.maxWidth !== undefined) parts.push(`(max-width: ${options.maxWidth}px)`)
  return parts.join(' and ')
}

export function useMediaQuery(options: MediaQueryOptions): boolean {
  const query = toQueryString(options)

  return useSyncExternalStore(
    (callback) => {
      if (typeof window === 'undefined' || !window.matchMedia) {
        return () => {}
      }
      const media = window.matchMedia(query)
      media.addEventListener('change', callback)
      return () => media.removeEventListener('change', callback)
    },
    () => {
      if (typeof window === 'undefined' || !window.matchMedia) {
        return false
      }
      return window.matchMedia(query).matches
    },
    () => false
  )
}

export default useMediaQuery
