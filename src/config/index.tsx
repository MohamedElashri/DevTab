// Keys
export const BUILD_TARGET = (import.meta.env.VITE_BUILD_TARGET as 'web' | 'extension') || 'web'

// Meta
export const name = 'Hackertab.dev (Personal Fork)'
export const slogan = '— Stay updated with the new technology and trends'
export const repository = 'https://github.com/medyo/hackertab.dev'
export const contactEmail = 'hello@hackertab.dev'
export const maxCardsPerRow = 4
export const supportLink = 'https://github.com/medyo/hackertab.dev/issues'
export const changeLogLink = 'https://api.github.com/repos/medyo/hackertab.dev/releases'

export const LS_PREFERENCES_KEY = 'hackerTabPrefs'
export const MAX_ITEMS_PER_CARD = 50

export type DateRangeType = {
  value: 'daily' | 'monthly' | 'weekly'
  label: string
}
export const dateRanges: DateRangeType[] = [
  { label: 'Today', value: 'daily' },
  { label: 'This week', value: 'weekly' },
  { label: 'This month', value: 'monthly' },
]
