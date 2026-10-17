import { useCallback, useEffect, useState } from 'react'
import { BsFillBookmarksFill, BsFillGearFill, BsMoonFill } from 'src/components/Elements/Icons'
import { CgTab } from 'src/components/Elements/Icons'
import { IoMdSunny } from 'src/components/Elements/Icons'
import { MdDoDisturbOff } from 'src/components/Elements/Icons'
import { Link, useLocation, useNavigate } from 'src/lib/router'
import { Button, CircleButton, DevTabLogo } from 'src/components/Elements'
import { UserTags } from 'src/components/Elements/UserTags'
import { useUserPreferences } from 'src/stores/preferences'
import { SearchEngineBar } from '../Elements/SearchBar/SearchEngineBar'

export const Header = () => {
  const [themeIcon, setThemeIcon] = useState(<BsMoonFill />)
  const { theme, setTheme, setDNDDuration, isDNDModeActive } = useUserPreferences()
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
