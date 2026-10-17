import React from 'react'
import { Outlet } from 'react-router-dom'
import { Spinner } from 'src/components/Elements'
import 'src/assets/App.css'
import { Header } from './Header'

export const AppLayout = () => {
  return (
    <div className="App">
      <Header />
      <React.Suspense
        fallback={
          <div className="appLoading">
            <Spinner size="medium" />
          </div>
        }>
        <Outlet />
      </React.Suspense>
    </div>
  )
}
