import React from 'react'
import { Spinner } from 'src/components/Elements'
import 'src/assets/App.css'
import { Header } from './Header'

export const AppLayout = ({ children }: { children?: React.ReactNode }) => {
  return (
    <div className="App">
      <Header />
      <React.Suspense
        fallback={
          <div className="appLoading">
            <Spinner size="medium" />
          </div>
        }>
        {children}
      </React.Suspense>
    </div>
  )
}
