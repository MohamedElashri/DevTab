import React, { memo, ReactNode, useMemo } from 'react'
import { Placeholder } from 'src/components/placeholders'
import { MAX_ITEMS_PER_CARD } from 'src/config'
import { useUserPreferences } from 'src/stores/preferences'
import { useReadPosts } from 'src/stores/readPosts'

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

    return items.filter((item: T) => !hasId(item) || readPostIdSet.has(item.id))
  }, [items, readPostIdSet, showReadPosts])

  const sortedData = useMemo(() => {
    if (!filteredItems || filteredItems.length == 0) return []
    if (!sortBy) return filteredItems

    const result = sortFn
      ? [...filteredItems].sort(sortFn)
      : [...filteredItems].sort((a, b) => {
          const aVal = a[sortBy]
          const bVal = b[sortBy]
          if (typeof aVal === 'number' && typeof bVal === 'number') return bVal - aVal
          if (typeof aVal === 'string' && typeof bVal === 'string') return bVal.localeCompare(aVal)
          return 0
        })

    return result
  }, [sortBy, sortFn, filteredItems])

  const enrichedItems = useMemo(() => {
    if (!sortedData || sortedData.length === 0) {
      return []
    }

    try {
      return sortedData.slice(0, limit).map((item, index) => {
        const content: ReactNode[] = [renderItem(item, index)]
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
