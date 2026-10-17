import { AppLayout } from 'src/components/Layout/AppLayout'
import { SettingsLayout } from 'src/components/Layout/SettingsLayout'
import { HashRouter, useLocation } from 'src/lib/router'
import { lazyImport } from 'src/utils/lazyImport'

const { App } = lazyImport(() => import('src/App'), 'App')

const MainContent = () => {
  const location = useLocation()
  const isSettings = location.pathname.startsWith('/settings')

  return (
    <AppLayout>
      {isSettings ? <SettingsLayout /> : <App />}
    </AppLayout>
  )
}

export const AppRoutes = () => {
  return (
    <HashRouter>
      <MainContent />
    </HashRouter>
  )
}
