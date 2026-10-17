export const repository = 'https://github.com/MohamedElashri/DevTab'
export const appVersion = __APP_VERSION__
export const maxCardsPerRow = 4
export const MAX_ITEMS_PER_CARD = 50

type DateRangeType = {
  value: 'daily' | 'monthly' | 'weekly'
  label: string
}
export const dateRanges: DateRangeType[] = [
  { label: 'Today', value: 'daily' },
  { label: 'This week', value: 'weekly' },
  { label: 'This month', value: 'monthly' },
]
