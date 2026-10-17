import { PersistQueryClientProvider } from '@tanstack/react-query-persist-client'
import 'src/assets/normalize.css'
import 'src/assets/index.css'
import { persister, queryClient } from 'src/lib/react-query'
import { AppErrorBoundary } from 'src/providers/AppErrorBoundary'
import { AppRoutes } from './routes/AppRoutes'

import '@szhsin/react-menu/dist/index.css'
import '@szhsin/react-menu/dist/transitions/zoom.css'
import { createRoot } from 'react-dom/client'

const container = document.getElementById('root')
if (!container) {
  throw new Error('Failed to find the root element')
}

const root = createRoot(container)
root.render(
  <AppErrorBoundary>
    <PersistQueryClientProvider client={queryClient} persistOptions={{ persister: persister }}>
      <AppRoutes />
    </PersistQueryClientProvider>
  </AppErrorBoundary>
)
