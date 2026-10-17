import React, { createContext, useContext, useEffect, useRef, useState, useCallback } from 'react'
import { createPortal } from 'react-dom'
import clsx from 'src/utils/clsx'
import './Menu.css'

type MenuContextType = {
  closeMenu: () => void
}

const MenuContext = createContext<MenuContextType>({
  closeMenu: () => {},
})

export type MenuProps = {
  menuButton: React.ReactNode
  children: React.ReactNode
  className?: string
  menuClassName?: string
  theming?: string
  portal?: boolean
  transition?: boolean
  direction?: 'bottom' | 'top' | 'left' | 'right'
  align?: 'start' | 'end' | 'center'
}

export const Menu = ({
  menuButton,
  children,
  className,
  menuClassName,
  theming = 'dark',
  direction = 'bottom',
  align = 'start',
  portal = false,
}: MenuProps) => {
  const [isOpen, setIsOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const buttonRef = useRef<HTMLButtonElement>(null)
  const menuRef = useRef<HTMLUListElement>(null)
  const [coords, setCoords] = useState<{ top: number; right: number }>({ top: 0, right: 0 })

  const closeMenu = useCallback(() => {
    setIsOpen(false)
  }, [])

  const updatePosition = useCallback(() => {
    if (!buttonRef.current) return
    const rect = buttonRef.current.getBoundingClientRect()
    setCoords({
      top: rect.bottom + 4,
      right: window.innerWidth - rect.right,
    })
  }, [])

  useEffect(() => {
    if (!isOpen) return

    if (portal) {
      updatePosition()
    }

    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as Node
      if (
        menuRef.current &&
        !menuRef.current.contains(target) &&
        buttonRef.current &&
        !buttonRef.current.contains(target)
      ) {
        setIsOpen(false)
      }
    }

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsOpen(false)
      }
    }

    const handleScrollOrResize = () => {
      if (portal) {
        updatePosition()
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    document.addEventListener('keydown', handleKeyDown)
    if (portal) {
      window.addEventListener('scroll', handleScrollOrResize, true)
      window.addEventListener('resize', handleScrollOrResize)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('keydown', handleKeyDown)
      if (portal) {
        window.removeEventListener('scroll', handleScrollOrResize, true)
        window.removeEventListener('resize', handleScrollOrResize)
      }
    }
  }, [isOpen, portal, updatePosition])

  const menuList = isOpen && (
    <ul
      ref={menuRef}
      className={clsx(
        'szh-menu',
        'szh-menu--state-open',
        `szh-menu--dir-${direction}`,
        `szh-menu--align-${align}`,
        menuClassName
      )}
      style={portal ? { position: 'fixed', top: coords.top, right: coords.right } : undefined}
      role="menu">
      {children}
    </ul>
  )

  return (
    <MenuContext.Provider value={{ closeMenu }}>
      <div
        ref={containerRef}
        className={clsx(
          'szh-menu-container',
          theming && `szh-menu-container--theme-${theming}`,
          className
        )}>
        <button
          ref={buttonRef}
          type="button"
          className="szh-menu-button"
          onClick={() => setIsOpen((prev) => !prev)}
          aria-expanded={isOpen}
          aria-haspopup="menu">
          {menuButton}
        </button>

        {portal && typeof document !== 'undefined'
          ? createPortal(menuList, document.body)
          : menuList}
      </div>
    </MenuContext.Provider>
  )
}

export type MenuItemProps = {
  children: React.ReactNode
  onClick?: () => void
  disabled?: boolean
  className?: string
  type?: 'radio' | 'checkbox' | string
  value?: unknown
  checked?: boolean
}

export const MenuItem = ({
  children,
  onClick,
  disabled,
  className,
  type,
  checked,
}: MenuItemProps) => {
  const { closeMenu } = useContext(MenuContext)
  const [isHovered, setIsHovered] = useState(false)

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (disabled) return
    onClick?.()
    closeMenu()
  }

  const isChecked = checked || (type === 'radio' && disabled)

  return (
    <li
      role="menuitem"
      aria-disabled={disabled}
      className={clsx(
        'szh-menu__item',
        'menuItem',
        disabled && 'szh-menu__item--disabled',
        type === 'radio' && 'szh-menu__item--type-radio',
        type === 'checkbox' && 'szh-menu__item--type-checkbox',
        isChecked && 'szh-menu__item--checked',
        isHovered && !disabled && 'szh-menu__item--hover',
        className
      )}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={handleClick}>
      {children}
    </li>
  )
}

export const MenuDivider = () => <li className="szh-menu__divider" role="separator" />

export type SubMenuProps = {
  label: React.ReactNode
  children: React.ReactNode
  className?: string
  disabled?: boolean
}

export const SubMenu = ({ label, children, className, disabled }: SubMenuProps) => {
  const [isOpen, setIsOpen] = useState(false)
  const [isHovered, setIsHovered] = useState(false)
  const [openToRight, setOpenToRight] = useState(false)
  const itemRef = useRef<HTMLLIElement>(null)
  const closeTimerRef = useRef<number | null>(null)

  const clearTimer = () => {
    if (closeTimerRef.current !== null) {
      window.clearTimeout(closeTimerRef.current)
      closeTimerRef.current = null
    }
  }

  const handleMouseEnter = () => {
    if (disabled) return
    clearTimer()
    setIsHovered(true)
    setIsOpen(true)
  }

  const handleMouseLeave = () => {
    clearTimer()
    closeTimerRef.current = window.setTimeout(() => {
      setIsHovered(false)
      setIsOpen(false)
    }, 150)
  }

  useEffect(() => {
    return () => {
      clearTimer()
    }
  }, [])

  useEffect(() => {
    if (isOpen && itemRef.current) {
      const rect = itemRef.current.getBoundingClientRect()
      const spaceLeft = rect.left
      const spaceRight = window.innerWidth - rect.right
      if (spaceLeft < 200 && spaceRight >= 200) {
        setOpenToRight(true)
      } else {
        setOpenToRight(false)
      }
    }
  }, [isOpen])

  return (
    <li
      ref={itemRef}
      className={clsx('szh-menu__submenu', className)}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}>
      <div
        role="menuitem"
        aria-haspopup="true"
        aria-expanded={isOpen}
        aria-disabled={disabled}
        className={clsx(
          'szh-menu__item',
          'szh-menu__item--submenu',
          'menuItem',
          disabled && 'szh-menu__item--disabled',
          (isHovered || isOpen) && !disabled && 'szh-menu__item--hover'
        )}
        onClick={(e) => {
          e.stopPropagation()
          if (!disabled) {
            clearTimer()
            setIsOpen((prev) => !prev)
          }
        }}>
        {label}
      </div>

      {isOpen && (
        <ul
          className={clsx(
            'szh-menu',
            'szh-menu--state-open',
            openToRight ? 'szh-menu--submenu-right' : 'szh-menu--submenu-left'
          )}
          role="menu"
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}>
          {children}
        </ul>
      )}
    </li>
  )
}
