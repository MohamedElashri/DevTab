import React from 'react'

type ConfigurationWrapperProps = {
  children: React.ReactNode
}

export const ConfigurationWrapper = ({ children }: ConfigurationWrapperProps) => {
  return <>{children}</>
}
