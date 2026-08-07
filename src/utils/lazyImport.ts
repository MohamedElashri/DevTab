import * as React from 'react'

export function lazyImport<
  M extends Record<string, unknown>,
  K extends keyof M
>(factory: () => Promise<M>, name: K): M {
  return Object.create({
    [name]: React.lazy(() =>
      factory().then((module) => ({
        default: module[name] as React.ComponentType,
      }))
    ),
  })
}
