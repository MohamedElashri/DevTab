import { useCallback, useEffect, useState } from 'react'
import { BsFillBookmarksFill, BsFillGearFill, BsMoonFill } from 'react-icons/bs'
import { CgTab } from 'react-icons/cg'
import { IoMdSunny } from 'react-icons/io'
import { MdDoDisturbOff } from 'react-icons/md'
import { RiDashboardHorizontalFill } from 'react-icons/ri'
import { TfiLayoutColumn4Alt } from 'react-icons/tfi'
import { Link, useLocation, useNavigate } from 'react-router'
import DevTabLogo from 'src/assets/logo.svg?react'
import { UserTags } from 'src/components/Elements/UserTags'
import { useUserPreferences } from 'src/stores/preferences'
import { Button, CircleButton } from '../Elements'
import { SearchEngineBar } from '../Elements/SearchBar/SearchEngineBar'

export const Header = () => {
  const [themeIcon, setThemeIcon] = useState(<BsMoonFill />)
  const { theme, setTheme, setDNDDuration, isDNDModeActive, layout, setLayout } =
    useUserPreferences()
  const navigate = useNavigate()
  const location = useLocation()

  useEffect(() => {
    document.documentElement.classList.add(theme)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    if (theme === 'light') {
      document.documentElement.classList.replace('dark', theme)
      setThemeIcon(<BsMoonFill />)
    } else if (theme === 'dark') {
      document.documentElement.classList.replace('light', theme)
      setThemeIcon(<IoMdSunny />)
    }
  }, [theme])

  const onThemeChange = useCallback(() => {
    const newTheme = theme === 'dark' ? 'light' : 'dark'
    setTheme(newTheme)
  }, [theme, setTheme])

  const onLayoutChange = useCallback(() => {
    const newLayout = layout === 'cards' ? 'grid' : 'cards'
    setLayout(newLayout)
  }, [layout, setLayout])

  const onSettingsClick = useCallback(() => {
    navigate('/settings/general')
  }, [navigate])

  const onUnpauseClicked = useCallback(() => {
    setDNDDuration('never')
  }, [setDNDDuration])

  return (
    <>
      <header className="AppHeader">
        <span className="AppName">
          <i className="logo">
            <CgTab />
          </i>{' '}
          <Link to="/">
            <DevTabLogo aria-label="devtab" className="logoText" />
          </Link>
        </span>
        <SearchEngineBar />
        <div className="buttonsFlex extras mobileOnly">
          <CircleButton onClick={onSettingsClick}>
            <BsFillGearFill />
          </CircleButton>
        </div>
        <div className="buttonsFlex extras">
          {isDNDModeActive() && (
            <Button onClick={onUnpauseClicked} className="dndButton">
              <MdDoDisturbOff />
              Unpause
            </Button>
          )}

          <CircleButton onClick={onSettingsClick}>
            <BsFillGearFill />
          </CircleButton>
          <CircleButton onClick={onLayoutChange}>
            {layout === 'cards' ? <RiDashboardHorizontalFill /> : <TfiLayoutColumn4Alt />}
          </CircleButton>
          <CircleButton onClick={onThemeChange} variant="darkfocus">
            {themeIcon}
          </CircleButton>
          <CircleButton onClick={() => navigate('/settings/bookmarks')}>
            <BsFillBookmarksFill />
          </CircleButton>
        </div>
        {location.pathname === '/' && <UserTags />}
      </header>
    </>
  )
}
