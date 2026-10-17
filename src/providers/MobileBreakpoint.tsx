import { useMediaQuery } from 'src/hooks/useMediaQuery'

export const MobileBreakpoint = ({ children }: { children: React.ReactNode }) => {
  const isMobile = useMediaQuery({ maxWidth: 767 })
  return isMobile ? children : null
}
