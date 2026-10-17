/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useCallback, useContext, useEffect, useState } from 'react'

export type Location = {
  pathname: string
}

export type NavigateFunction = (to: string) => void

type RouterContextType = {
  location: Location
  navigate: NavigateFunction
}

const RouterContext = createContext<RouterContextType>({
  location: { pathname: '/' },
  navigate: () => {},
})

function getPathnameFromHash(): string {
  if (typeof window === 'undefined') return '/'
  const hash = window.location.hash
  if (!hash || hash === '#') return '/'
  const path = hash.startsWith('#') ? hash.slice(1) : hash
  return path.startsWith('/') ? path : '/' + path
}

export const HashRouter = ({ children }: { children: React.ReactNode }) => {
  const [pathname, setPathname] = useState<string>(getPathnameFromHash)

  useEffect(() => {
    const handleHashChange = () => {
      setPathname(getPathnameFromHash())
    }

    window.addEventListener('hashchange', handleHashChange)
    return () => window.removeEventListener('hashchange', handleHashChange)
  }, [])

  const navigate = useCallback<NavigateFunction>((to: string) => {
    const target = to.startsWith('/') ? to : '/' + to
    window.location.hash = target
  }, [])

  return (
    <RouterContext.Provider value={{ location: { pathname }, navigate }}>
      {children}
    </RouterContext.Provider>
  )
}

export function useLocation(): Location {
  return useContext(RouterContext).location
}

export function useNavigate(): NavigateFunction {
  return useContext(RouterContext).navigate
}

export type LinkProps = React.AnchorHTMLAttributes<HTMLAnchorElement> & {
  to: string
}

export const Link = ({ to, children, onClick, ...props }: LinkProps) => {
  const navigate = useNavigate()

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    onClick?.(e)
    if (
      !e.defaultPrevented &&
      e.button === 0 &&
      !e.metaKey &&
      !e.ctrlKey &&
      !e.shiftKey &&
      !e.altKey
    ) {
      e.preventDefault()
      navigate(to)
    }
  }

  const href = `#${to.startsWith('/') ? to : '/' + to}`

  return (
    <a href={href} onClick={handleClick} {...props}>
      {children}
    </a>
  )
}

export type NavLinkProps = Omit<LinkProps, 'className'> & {
  className?: string | ((props: { isActive: boolean }) => string)
}

export const NavLink = ({ to, className, children, ...props }: NavLinkProps) => {
  const location = useLocation()
  const isActive = location.pathname === to

  const computedClassName =
    typeof className === 'function' ? className({ isActive }) : className

  return (
    <Link to={to} className={computedClassName} {...props}>
      {children}
    </Link>
  )
}
