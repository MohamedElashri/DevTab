import { memo, useMemo } from 'react'
import { MY_LANGUAGES_OPTION } from '../config'

type HeaderTitleProps = {
  label: string
  fallbackTag: {
    label: string
    value: string
  }
  selectedTag: {
    label: string
    value: string
  }
  children?: React.ReactNode
}
const CardHeader = ({ label, fallbackTag, selectedTag, children }: HeaderTitleProps) => {
  const highlightLabel = useMemo(() => {
    if (!selectedTag || selectedTag.value === fallbackTag.value) return null
    if (selectedTag.value === MY_LANGUAGES_OPTION.value) return MY_LANGUAGES_OPTION.label
    return selectedTag.label
  }, [selectedTag, fallbackTag])

  if (children) {
    return <>{children}</>
  }

  return (
    <>
      {label}
      {highlightLabel && <span className="blockHeaderHighlight">{highlightLabel}</span>}
    </>
  )
}

export const MemoizedCardHeader = memo(CardHeader)
