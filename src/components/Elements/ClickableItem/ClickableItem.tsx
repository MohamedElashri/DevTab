import React from 'react'
import { useUserPreferences } from 'src/stores/preferences'

type ClickableItemProps = {
  link: string
  className?: string
  children: React.ReactNode
}
export const ClickableItem = ({
  link,
  className,
  children,
}: ClickableItemProps) => {
  const { openLinksNewTab } = useUserPreferences()

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault()

    if (!link) {
      return
    }

    window.open(link, openLinksNewTab ? '_blank' : '_self')
  }

  return (
    <a href={link} className={className} onClick={handleClick}>
      {children}
    </a>
  )
}
