import React from 'react'
import { NavLink, useLocation } from 'src/lib/router'
import { lazyImport } from 'src/utils/lazyImport'
import './settings.css'

const { GeneralSettings } = lazyImport(() => import('src/features/settings'), 'GeneralSettings')
const { SourceSettings } = lazyImport(() => import('src/features/settings'), 'SourceSettings')
const { SearchEngineSettings } = lazyImport(
  () => import('src/features/settings'),
  'SearchEngineSettings'
)
const { BookmarkSettings } = lazyImport(() => import('src/features/settings'), 'BookmarkSettings')
const { TopicSettings } = lazyImport(() => import('src/features/settings'), 'TopicSettings')

export const SettingsLayout = () => {
  const location = useLocation()

  const navigation = [
    {
      name: 'Topics',
      path: '/settings/topics',
    },
    {
      name: 'Sources',
      path: '/settings/sources',
    },
    {
      name: 'Bookmarks',
      path: '/settings/bookmarks',
    },
    {
      name: 'AI Prompt Engines',
      path: '/settings/ai-engine',
    },
    {
      name: 'Settings',
      path: '/settings/general',
    },
  ]

  const renderActiveSetting = () => {
    if (location.pathname.includes('/topics')) return <TopicSettings />
    if (location.pathname.includes('/sources')) return <SourceSettings />
    if (location.pathname.includes('/bookmarks')) return <BookmarkSettings />
    if (location.pathname.includes('/ai-engine')) return <SearchEngineSettings />
    return <GeneralSettings />
  }

  return (
    <div className="settings">
      <div className="horizontalTabsLayout">
        <nav className="navigation">
          {navigation.map((item) => {
            return (
              <NavLink
                key={item.name}
                to={item.path}
                className={({ isActive }) => 'link ' + (isActive ? 'active' : '')}>
                {item.name}
              </NavLink>
            )
          })}
        </nav>

        <div className="content">
          <React.Suspense fallback={<></>}>
            {renderActiveSetting()}
          </React.Suspense>
        </div>
      </div>
    </div>
  )
}
