import React from 'react'
import { ClickableItem } from '../ClickableItem'

type CardLinkProps = {
  link: string
  children: React.ReactNode
  className?: string
}
export const CardLink = ({
  link,
  children,
  className = '',
}: CardLinkProps) => {
  return (
    <ClickableItem
      link={link}
      className={'rowLink' + (className ? ` ${className}` : '')}>
      {children}
    </ClickableItem>
  )
}
