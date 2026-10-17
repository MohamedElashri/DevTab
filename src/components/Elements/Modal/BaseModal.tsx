import React, { useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import clsx from 'src/utils/clsx'

export type BaseModalProps = {
  isOpen: boolean
  onRequestClose?: () => void
  children?: React.ReactNode
  className?: string
  overlayClassName?: string
  shouldCloseOnEsc?: boolean
  shouldCloseOnOverlayClick?: boolean
  style?: {
    overlay?: React.CSSProperties
    content?: React.CSSProperties
  }
  ariaHideApp?: boolean
  shouldFocusAfterRender?: boolean
  contentLabel?: string
}

export const BaseModal = ({
  isOpen,
  onRequestClose,
  children,
  className = 'Modal',
  overlayClassName = 'Overlay',
  shouldCloseOnEsc = true,
  shouldCloseOnOverlayClick = true,
  style,
  contentLabel,
}: BaseModalProps) => {
  const modalRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!isOpen || !shouldCloseOnEsc) return

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.stopPropagation()
        onRequestClose?.()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, shouldCloseOnEsc, onRequestClose])

  if (!isOpen) return null

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget && shouldCloseOnOverlayClick) {
      onRequestClose?.()
    }
  }

  return createPortal(
    <div
      className={clsx('Overlay', overlayClassName)}
      style={style?.overlay}
      onClick={handleOverlayClick}>
      <div
        ref={modalRef}
        role="dialog"
        aria-modal="true"
        aria-label={contentLabel}
        className={clsx('Modal', className)}
        style={style?.content}
        onClick={(e) => e.stopPropagation()}>
        {children}
      </div>
    </div>,
    document.body
  )
}

export default BaseModal
