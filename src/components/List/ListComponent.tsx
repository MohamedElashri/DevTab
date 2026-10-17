import React, { memo, ReactNode, useMemo } from 'react'
import { MAX_ITEMS_PER_CARD } from 'src/config'
import { useUserPreferences } from 'src/stores/preferences'
import { useReadPosts } from 'src/stores/readPosts'
import { Article, Repository } from 'src/types'

export const Placeholder = () => (
  <div className="cardPlaceholder">
    <span className="line"></span>
    <span className="smallLine" />
    <div className="details">
      <span className="detail" />
      <span className="detail" style={{ width: '78px' }} />
      <span className="detail" style={{ width: '78px' }} />
    </div>
  </div>
)

type PlaceholdersProps = {
  placeholder: ReactNode
}

const Placeholders = memo<PlaceholdersProps>(({ placeholder }) => {
  return (
    <>
      {[...Array(7)].map((_, i) => (
        <span key={i}>{placeholder}</span>
      ))}
    </>
  )
})

export type ListComponentPropsType<T> = {
  items?: T[]
  sortBy?: keyof T
  sortFn?: (a: T, b: T) => number
  isLoading: boolean
  renderItem: (item: T, index: number) => React.ReactNode
  placeholder?: React.ReactNode
  header?: React.ReactNode
  error?: Error | null | undefined
  limit?: number
}

export function ListComponent<T>(props: ListComponentPropsType<T>) {
  const {
    items,
    sortBy,
    isLoading,
    error,
    sortFn,
    renderItem,
    header,
    placeholder = <Placeholder />,
    limit = MAX_ITEMS_PER_CARD,
  } = props

  const { showReadPosts } = useUserPreferences()
  const readPostIdSet = useReadPosts((state) => state.readPostIdSet)

  const filteredItems = useMemo(() => {
    if (!items || items.length === 0) {
      return []
    }

    if (showReadPosts) {
      return items
    }

    const hasId = (item: T): item is T & { id: string } =>
      typeof (item as { id?: unknown }).id === 'string'

    return items.filter((item) => {
      if (!hasId(item)) return true
      return !readPostIdSet.has(item.id)
    })
  }, [items, showReadPosts, readPostIdSet])

  const sortedData = useMemo(() => {
    if (sortFn) {
      return filteredItems.slice().sort(sortFn)
    }

    if (sortBy) {
      return filteredItems.slice().sort((a, b) => {
        if (a[sortBy] < b[sortBy]) {
          return 1
        }
        if (a[sortBy] > b[sortBy]) {
          return -1
        }
        return 0
      })
    }
    return filteredItems
  }, [filteredItems, sortBy, sortFn])

  const enrichedItems = useMemo(() => {
    try {
      return sortedData.slice(0, limit).flatMap((item, index) => {
        const content = [renderItem(item, index)]
        if (header && index === 0) {
          content.unshift(header)
        }

        return content
      })
    } catch {
      return []
    }
  }, [sortedData, header, renderItem, limit])

  if (isLoading) {
    return <Placeholders placeholder={placeholder} />
  }
  if (error) {
    return <p className="errorMsg">{error?.message}</p>
  }

  if (items && items.length == 0) {
    return (
      <p className="errorMsg">
        No items found, try adjusting your filter or choosing a different tag.
      </p>
    )
  }

  if (items && items.length > 0 && filteredItems.length === 0) {
    return (
      <div className="errorMsg">
        <span>✨</span>
        <b>You're all caught up!</b>
        <p>Check back later for fresh content.</p>
      </div>
    )
  }

  return <>{enrichedItems}</>
}

export function ListPostComponent(props: ListComponentPropsType<Article>) {
  return <ListComponent<Article> {...props} />
}

export function ListRepoComponent(props: ListComponentPropsType<Repository>) {
  return <ListComponent<Repository> {...props} />
}
