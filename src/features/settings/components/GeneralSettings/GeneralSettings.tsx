import React, { useEffect, useState } from 'react'
import Toggle from 'react-toggle'
import 'react-toggle/style.css'
import { SettingsContentLayout } from 'src/components/Layout/SettingsContentLayout'
import { useUserPreferences } from 'src/stores/preferences'
import { hasExtensionPermissions, requestExtensionPermissions } from 'src/utils/ensureExtensionPermissions'
import { CardsNumberSettings } from './CardsNumberSettings'
import { DNDSettings } from './DNDSettings'
import './generalSettings.css'
import { LayoutSettings } from './LayoutSettings'

export const GeneralSettings = () => {
  const {
    openLinksNewTab,
    listingMode,
    theme,
    maxVisibleCards,
    showReadPosts,
    setTheme,
    setListingMode,
    setMaxVisibleCards,
    setOpenLinksNewTab,
    setShowReadPosts,
  } = useUserPreferences()

  const [permsGranted, setPermsGranted] = useState<boolean | null>(null)

  useEffect(() => {
    hasExtensionPermissions().then(setPermsGranted)
  }, [])

  const onOpenLinksNewTabChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const checked = e.target.checked
    setOpenLinksNewTab(checked)
  }

  const onlistingModeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.checked ? 'compact' : 'normal'
    setListingMode(value)
  }

  const onDarkModeChange = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark'
    setTheme(newTheme)
  }

  const onShowReadPostsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setShowReadPosts(e.target.checked)
  }

  const handleRequestPerms = async () => {
    const granted = await requestExtensionPermissions()
    setPermsGranted(granted)
    if (granted) {
      window.location.reload()
    }
  }

  return (
    <SettingsContentLayout
      title="General Settings"
      description={
        'Customize your experience by selecting the number of cards you want to see, the search engine you want to use and more.'
      }>
      <div>
        <LayoutSettings />
        <CardsNumberSettings />

        <div className="settingRow">
          <p className="settingTitle">Dark Mode</p>
          <div className="settingContent">
            <Toggle checked={theme === 'dark'} icons={false} onChange={onDarkModeChange} />
          </div>
        </div>

        <div className="settingRow">
          <p className="settingTitle">Open links in a new tab</p>
          <div className="settingContent">
            <Toggle checked={openLinksNewTab} icons={false} onChange={onOpenLinksNewTabChange} />
          </div>
        </div>

        <div className="settingRow">
          <p className="settingTitle">Display read posts</p>
          <div className="settingContent">
            <Toggle checked={showReadPosts} icons={false} onChange={onShowReadPostsChange} />
          </div>
        </div>

        <div className="settingRow">
          <p className="settingTitle">Compact mode</p>
          <div className="settingContent">
            <Toggle
              checked={listingMode === 'compact'}
              icons={false}
              onChange={onlistingModeChange}
            />
          </div>
        </div>

        <DNDSettings />

        {permsGranted === false && (
          <div className="settingRow">
            <p className="settingTitle">Site permissions</p>
            <div className="settingContent">
              <button
                className="btn"
                onClick={handleRequestPerms}
                style={{ padding: '6px 12px', cursor: 'pointer' }}
              >
                Grant permissions
              </button>
              <p style={{ fontSize: '0.8rem', marginTop: 4, opacity: 0.7 }}>
                Required for Lobsters &amp; Reddit cards to load.
              </p>
            </div>
          </div>
        )}

        {permsGranted === true && (
          <div className="settingRow">
            <p className="settingTitle">Site permissions</p>
            <div className="settingContent">
              <span style={{ color: '#4caf50' }}>Granted</span>
            </div>
          </div>
        )}
      </div>
    </SettingsContentLayout>
  )
}
