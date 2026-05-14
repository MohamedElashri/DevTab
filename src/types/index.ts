export type SearchEngineType = {
  url: string
  label: string
  logo?: string
  className?: string
  default?: boolean
}

export type SelectedCard = {
  id: number
  name: string
  type: 'rss' | 'supported'
}

export type Layout = 'grid' | 'cards'
export type Theme = 'dark' | 'light'
export type ListingMode = 'normal' | 'compact'

export type Article = {
  id: string
  url: string
  title: string
  tags: Array<string>
  comments_count: number
  points_count: number
  image_url: string
  published_at: number
  description?: string
  source: string
  canonical_url?: string
}

export type Product = {
  id: string
  url: string
  title: string
  tags: Array<string>
  comments_count: number
  points_count: number
  image_url: string
  published_at: number
  description?: string
  tagline: string
  votes_count: number
  topics: Array<string>
}

export type Repository = {
  id: string
  url: string
  title: string
  tags: Array<string>
  comments_count: number
  points_count: number
  image_url: string
  published_at: number
  description?: string
  technology: string
  stars_count: number
  source: string
  owner: string
  forks_count: number
  stars_in_range: number
  name: string
}

export type ArticleFeedItemData = {
  title: string
  id: string
  url: string
  date: Date
  image: string
  tags: Array<string>
  type: 'post'
  source: string
}

export type GithubFeedItemData = {
  title: string
  id: string
  url: string
  date: Date
  image: string
  tags: Array<string>
  type: 'github'
  stars: number
  stars_in_range: number
  forks: number
  programmingLanguage: string
  description?: string
}

export type FeedItemData =
  | ArticleFeedItemData
  | GithubFeedItemData

export type SupportedCardType = {
  value: string
  analyticsTag: string
  label: string
  link?: string
  type: 'rss' | 'supported'
  component?: React.FunctionComponent<CardPropsType>
  feedUrl?: string
  icon?: React.ReactNode | string
  badge?: string
}

export type CardPropsType = {
  meta: Omit<SupportedCardType, 'component'>
  knob?: React.ReactNode
  className?: string
}

export type BaseItemPropsType<
  T extends {
    id: string
  }
> = {
  item: T
  className?: string
  analyticsTag: string
  dateRange?: string
  selectedTag?: { label: string; value: string }
}

export type CardSettingsType = {
  language?: string
  sortBy: string
  dateRange?: string
}

export type Option = {
  label: string
  value: string
  icon?: React.ReactNode
  removeable?: boolean
}

export type DNDDuration =
  | {
      value: number
      countdown: number
    }
  | 'always'
  | 'never'
