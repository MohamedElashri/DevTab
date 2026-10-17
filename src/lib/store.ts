import { useSyncExternalStore } from 'react'

export type StateStorage = {
  getItem: (name: string) => string | null | Promise<string | null>
  setItem: (name: string, value: string) => void | Promise<void>
  removeItem: (name: string) => void | Promise<void>
}

export type StorageValue<S> = {
  state: S
  version?: number
}

export type PersistStorage<S = unknown> = {
  getItem: (name: string) => StorageValue<S> | null
  setItem: (name: string, value: StorageValue<S>) => void
  removeItem: (name: string) => void
}

export function createJSONStorage<S = unknown>(getStorage: () => StateStorage): PersistStorage<S> {
  return {
    getItem: (name) => {
      try {
        const val = getStorage().getItem(name)
        if (typeof val === 'string') {
          return JSON.parse(val) as StorageValue<S>
        }
        return null
      } catch {
        return null
      }
    },
    setItem: (name, value) => {
      try {
        getStorage().setItem(name, JSON.stringify(value))
      } catch {
        // ignore
      }
    },
    removeItem: (name) => {
      try {
        getStorage().removeItem(name)
      } catch {
        // ignore
      }
    },
  }
}

export const defaultLocalStorage = createJSONStorage<unknown>(() => ({
  getItem: (name) => (typeof localStorage !== 'undefined' ? localStorage.getItem(name) : null),
  setItem: (name, val) => {
    if (typeof localStorage !== 'undefined') localStorage.setItem(name, val)
  },
  removeItem: (name) => {
    if (typeof localStorage !== 'undefined') localStorage.removeItem(name)
  },
}))

export type SetState<T> = (
  partial: Partial<T> | ((state: T) => Partial<T> | T),
  replace?: boolean
) => void
export type GetState<T> = () => T

export type StateCreator<T extends object = Record<string, unknown>> = (
  set: SetState<T>,
  get: GetState<T>
) => T

export type PersistOptions<T extends object = Record<string, unknown>> = {
  name: string
  storage?: PersistStorage<unknown>
  version?: number
  migrate?: (persistedState: unknown, version: number) => T | Promise<T>
  partialize?: (state: T) => unknown
  onRehydrateStorage?: () => (state: T | undefined) => void
}

export function shallowEqual(a: unknown, b: unknown): boolean {
  if (Object.is(a, b)) return true
  if (typeof a !== 'object' || a === null || typeof b !== 'object' || b === null) return false
  const keysA = Object.keys(a)
  const keysB = Object.keys(b)
  if (keysA.length !== keysB.length) return false
  const recordA = a as Record<string, unknown>
  const recordB = b as Record<string, unknown>
  for (const key of keysA) {
    if (!Object.prototype.hasOwnProperty.call(recordB, key) || !Object.is(recordA[key], recordB[key])) {
      return false
    }
  }
  return true
}

export function useShallow<T, U>(selector: (state: T) => U): (state: T) => U {
  let prevSlice: U | undefined
  return (state: T) => {
    const nextSlice = selector(state)
    if (prevSlice !== undefined && shallowEqual(prevSlice, nextSlice)) {
      return prevSlice
    }
    prevSlice = nextSlice
    return nextSlice
  }
}

export type StoreApi<T extends object = Record<string, unknown>> = {
  getState: () => T
  setState: SetState<T>
  subscribe: (listener: () => void) => () => void
}

export type UseBoundStore<T extends object = Record<string, unknown>> = {
  (): T
  <U>(selector: (state: T) => U): U
} & StoreApi<T>

export function createStore<T extends object>(
  creatorOrPersist: StateCreator<T> | { creator: StateCreator<T>; options: PersistOptions<T> }
): UseBoundStore<T> {
  let creator: StateCreator<T>
  let persistOpts: PersistOptions<T> | undefined

  if (typeof creatorOrPersist === 'function') {
    creator = creatorOrPersist
  } else {
    creator = creatorOrPersist.creator
    persistOpts = creatorOrPersist.options
  }

  let state: T
  const listeners = new Set<() => void>()

  const getState: GetState<T> = () => state

  const storage = persistOpts?.storage || (persistOpts ? defaultLocalStorage : undefined)

  const setState: SetState<T> = (partial, replace) => {
    const nextState =
      typeof partial === 'function' ? (partial as (s: T) => Partial<T> | T)(state) : partial
    if (!Object.is(nextState, state)) {
      state = replace ? (nextState as T) : Object.assign({}, state, nextState)
      if (persistOpts && storage) {
        const toSave = persistOpts.partialize ? persistOpts.partialize(state) : state
        storage.setItem(persistOpts.name, {
          state: toSave,
          version: persistOpts.version ?? 0,
        })
      }
      listeners.forEach((listener) => listener())
    }
  }

  const defaultState = creator(setState, getState)
  state = defaultState

  if (persistOpts && storage) {
    try {
      const persisted = storage.getItem(persistOpts.name)
      if (persisted && persisted.state) {
        let loadedState = persisted.state
        const persistedVersion = persisted.version ?? 0
        const currentVersion = persistOpts.version ?? 0

        if (persistOpts.migrate && persistedVersion !== currentVersion) {
          const migrated = persistOpts.migrate(loadedState, persistedVersion)
          if (migrated instanceof Promise) {
            migrated.then((s) => {
              state = Object.assign({}, defaultState, s)
              if (persistOpts?.onRehydrateStorage) {
                const cb = persistOpts.onRehydrateStorage()
                cb?.(state)
              }
              listeners.forEach((l) => l())
            })
          } else {
            loadedState = migrated
          }
        }
        state = Object.assign({}, defaultState, loadedState as T)
      }
      if (persistOpts?.onRehydrateStorage) {
        const cb = persistOpts.onRehydrateStorage()
        cb?.(state)
      }
    } catch (e) {
      console.warn(`Failed to hydrate store ${persistOpts.name}:`, e)
    }
  }

  const subscribe = (listener: () => void) => {
    listeners.add(listener)
    return () => {
      listeners.delete(listener)
    }
  }

  const storeHook = (<U>(selector?: (s: T) => U) => {
    return useSyncExternalStore(
      subscribe,
      () => (selector ? selector(state) : state),
      () => (selector ? selector(state) : state)
    )
  }) as UseBoundStore<T>

  storeHook.getState = getState
  storeHook.setState = setState
  storeHook.subscribe = subscribe

  return storeHook
}

export function persist<T extends object>(
  creator: StateCreator<T>,
  options: PersistOptions<T>
): { creator: StateCreator<T>; options: PersistOptions<T> } {
  return { creator, options }
}

export function create<T extends object = Record<string, unknown>>(): (
  creatorOrPersist: StateCreator<T> | { creator: StateCreator<T>; options: PersistOptions<T> }
) => UseBoundStore<T>
export function create<T extends object = Record<string, unknown>>(
  creatorOrPersist: StateCreator<T> | { creator: StateCreator<T>; options: PersistOptions<T> }
): UseBoundStore<T>
export function create<T extends object = Record<string, unknown>>(
  creatorOrPersist?: StateCreator<T> | { creator: StateCreator<T>; options: PersistOptions<T> }
) {
  if (!creatorOrPersist) {
    return (arg: StateCreator<T> | { creator: StateCreator<T>; options: PersistOptions<T> }) =>
      createStore<T>(arg)
  }
  return createStore<T>(creatorOrPersist)
}
