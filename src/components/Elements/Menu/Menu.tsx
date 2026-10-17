import React, { createContext, useContext, useEffect, useRef, useState } from 'react'
import { FiChevronLeft } from 'src/components/Elements/Icons'
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
  theming?: string
  portal?: boolean
  transition?: boolean
  direction?: 'bottom' | 'top' | 'left' | 'right'
  align?: 'start' | 'end' | 'center'
}

export const Menu = ({ menuButton, children, className }: MenuProps) => {
  const [isOpen, setIsOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  const closeMenu = () => {
    setIsOpen(false)
  }

  useEffect(() => {
    if (!isOpen) return

    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setIsOpen(false)
      }
    }

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [isOpen])

  return (
    <MenuContext.Provider value={{ closeMenu }}>
      <div ref={menuRef} className="szh-menu-container">
        <button
          type="button"
          className="szh-menu-button"
          onClick={() => setIsOpen((prev) => !prev)}
          aria-expanded={isOpen}
          aria-haspopup="menu">
          {menuButton}
        </button>

        {isOpen && (
          <ul className={clsx('szh-menu', className)} role="menu">
            {children}
          </ul>
        )}
      </div>
    </MenuContext.Provider>
  )
}

export type MenuItemProps = {
  children: React.ReactNode
  onClick?: () => void
  disabled?: boolean
  className?: string
  type?: string
  value?: unknown
}

export const MenuItem = ({
  children,
  onClick,
  disabled,
  className,
}: MenuItemProps) => {
  const { closeMenu } = useContext(MenuContext)

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (disabled) return
    onClick?.()
    closeMenu()
  }

  return (
    <li
      role="menuitem"
      aria-disabled={disabled}
      className={clsx(
        'szh-menu__item',
        disabled && 'szh-menu__item--disabled',
        className
      )}
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
}

export const SubMenu = ({ label, children, className }: SubMenuProps) => {
  const [isOpen, setIsOpen] = useState(false)
  const itemRef = useRef<HTMLLIElement>(null)

  const handleMouseEnter = () => {
    setIsOpen(true)
  }

  const handleMouseLeave = () => {
    setIsOpen(false)
  }

  return (
    <li
      ref={itemRef}
      className={clsx('szh-menu__submenu-item', className)}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}>
      <div
        className="szh-menu__item szh-menu__submenu-label"
        onClick={() => setIsOpen((prev) => !prev)}>
        <FiChevronLeft className="szh-menu__submenu-arrow" />
        {label}
      </div>

      {isOpen && (
        <ul className="szh-menu__submenu" role="menu">
          {children}
        </ul>
      )}
    </li>
  )
}
