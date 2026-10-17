/* eslint-disable react-refresh/only-export-components */
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useSyncExternalStore,
} from 'react'
import { isDevelopment } from 'src/utils/Environment'

export interface CacheEntry<T = unknown> {
  data: T | undefined
  error: Error | null
  isLoading: boolean
  updatedAt: number
}

export interface DefaultOptions {
  queries?: {
    staleTime?: number
    gcTime?: number
    throwOnError?: boolean
    refetchOnWindowFocus?: boolean
    retry?: boolean
  }
}

export interface QueryClientOptions {
  defaultOptions?: DefaultOptions
}

const STORAGE_KEY = 'DEVTAB_QUERY_CACHE'
const LEGACY_STORAGE_KEY = 'REACT_QUERY_OFFLINE_CACHE'

export class QueryClient {
  private cache = new Map<string, CacheEntry>()
  private inFlight = new Map<string, Promise<unknown>>()
  private listeners = new Set<() => void>()
  private defaultOptions: {
    staleTime: number
    gcTime: number
  }

  constructor(options?: QueryClientOptions) {
    this.defaultOptions = {
      staleTime: options?.defaultOptions?.queries?.staleTime ?? (isDevelopment() ? 0 : 900000), // 15 mins
      gcTime: options?.defaultOptions?.queries?.gcTime ?? (isDevelopment() ? 0 : 3600000), // 1 hour
    }
    this.hydrate()
  }

  private hydrate() {
    try {
      const now = Date.now()
      const raw = typeof window !== 'undefined' ? window.localStorage.getItem(STORAGE_KEY) : null
      if (raw) {
        const parsed = JSON.parse(raw) as Record<string, { data: unknown; updatedAt: number }>
        for (const [key, val] of Object.entries(parsed)) {
          if (val && val.data !== undefined && now - val.updatedAt < this.defaultOptions.gcTime) {
            this.cache.set(key, {
              data: val.data,
              error: null,
              isLoading: false,
              updatedAt: val.updatedAt,
            })
          }
        }
        return
      }

      // Check legacy TanStack persister cache format
      const legacyRaw =
        typeof window !== 'undefined' ? window.localStorage.getItem(LEGACY_STORAGE_KEY) : null
      if (legacyRaw) {
        const parsed = JSON.parse(legacyRaw)
        const queries = parsed?.clientState?.queries
        if (Array.isArray(queries)) {
          for (const q of queries) {
            if (q?.queryHash && q?.state?.data !== undefined) {
              const updatedAt = q.state.dataUpdatedAt || now
              if (now - updatedAt < this.defaultOptions.gcTime) {
                this.cache.set(q.queryHash, {
                  data: q.state.data,
                  error: null,
                  isLoading: false,
                  updatedAt,
                })
              }
            }
          }
        }
      }
    } catch {
      // Ignore hydration failure
    }
  }

  private persist() {
    try {
      if (typeof window === 'undefined') return
      const now = Date.now()
      const toSave: Record<string, { data: unknown; updatedAt: number }> = {}
      for (const [key, val] of this.cache.entries()) {
        if (val.data !== undefined && now - val.updatedAt < this.defaultOptions.gcTime) {
          toSave[key] = {
            data: val.data,
            updatedAt: val.updatedAt,
          }
        }
      }
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(toSave))
    } catch {
      // Ignore persistence failure
    }
  }

  public subscribe = (listener: () => void): (() => void) => {
    this.listeners.add(listener)
    return () => {
      this.listeners.delete(listener)
    }
  }

  public notify() {
    this.listeners.forEach((listener) => listener())
  }

  public getQueryState<T>(keyHash: string): CacheEntry<T> | undefined {
    return this.cache.get(keyHash) as CacheEntry<T> | undefined
  }

  public setQueryData<T>(keyHash: string, data: T) {
    this.cache.set(keyHash, {
      data,
      error: null,
      isLoading: false,
      updatedAt: Date.now(),
    })
    this.persist()
    this.notify()
  }

  public fetchQuery<T>(
    keyHash: string,
    queryFn: () => Promise<T>,
    options?: { staleTime?: number }
  ): Promise<T> {
    const active = this.inFlight.get(keyHash)
    if (active) {
      return active as Promise<T>
    }

    const entry = this.cache.get(keyHash)
    const staleTime = options?.staleTime ?? this.defaultOptions.staleTime
    const isStale = !entry || Date.now() - entry.updatedAt >= staleTime

    if (entry && !isStale && entry.data !== undefined) {
      return Promise.resolve(entry.data as T)
    }

    if (!entry || entry.data === undefined) {
      this.cache.set(keyHash, {
        data: undefined,
        error: null,
        isLoading: true,
        updatedAt: entry?.updatedAt ?? 0,
      })
      this.notify()
    }

    const promise = (async () => {
      try {
        const result = await queryFn()
        this.cache.set(keyHash, {
          data: result,
          error: null,
          isLoading: false,
          updatedAt: Date.now(),
        })
        this.persist()
        this.notify()
        return result
      } catch (err) {
        const prev = this.cache.get(keyHash)
        const error = err instanceof Error ? err : new Error(String(err))
        this.cache.set(keyHash, {
          data: prev?.data,
          error,
          isLoading: false,
          updatedAt: prev?.updatedAt ?? 0,
        })
        this.notify()
        throw error
      } finally {
        this.inFlight.delete(keyHash)
      }
    })()

    this.inFlight.set(keyHash, promise)
    return promise
  }

  public clear() {
    this.cache.clear()
    this.inFlight.clear()
    try {
      if (typeof window !== 'undefined') {
        window.localStorage.removeItem(STORAGE_KEY)
      }
    } catch {
      // ignore
    }
    this.notify()
  }
}

export const queryConfig: DefaultOptions = {
  queries: {
    throwOnError: false,
    refetchOnWindowFocus: false,
    retry: false,
    staleTime: isDevelopment() ? 0 : 900000, // 15 minutes
    gcTime: isDevelopment() ? 0 : 3600000, // 1 hour
  },
}

export const queryClient = new QueryClient({ defaultOptions: queryConfig })

export const persister = {
  persistClient: async () => {},
  restoreClient: async () => {},
  removeClient: async () => {},
}

export const QueryClientContext = createContext<QueryClient>(queryClient)

export const QueryClientProvider = ({
  client,
  children,
}: {
  client: QueryClient
  children: React.ReactNode
}) => {
  return <QueryClientContext.Provider value={client}>{children}</QueryClientContext.Provider>
}

export const PersistQueryClientProvider = ({
  client,
  children,
}: {
  client: QueryClient
  persistOptions?: unknown
  children: React.ReactNode
}) => {
  return <QueryClientContext.Provider value={client}>{children}</QueryClientContext.Provider>
}

export type UseQueryOptions<TData = unknown> = {
  queryKey?: unknown[]
  queryFn?: () => Promise<TData>
  enabled?: boolean
  staleTime?: number
  gcTime?: number
}

export type UseQueryResult<TData = unknown> = {
  data: TData | undefined
  isLoading: boolean
  error: Error | null
  refetch: () => Promise<TData | undefined>
  isSuccess: boolean
  isError: boolean
}

export function useQuery<TData = unknown>(options: UseQueryOptions<TData>): UseQueryResult<TData> {
  const client = useContext(QueryClientContext) || queryClient
  const { queryKey = [], queryFn, enabled = true, staleTime } = options

  const keyHash = useMemo(() => JSON.stringify(queryKey), [queryKey])
  const queryFnRef = useRef(queryFn)
  queryFnRef.current = queryFn

  const subscribe = useCallback(
    (onStoreChange: () => void) => client.subscribe(onStoreChange),
    [client]
  )

  const getSnapshot = useCallback(() => {
    return client.getQueryState<TData>(keyHash)
  }, [client, keyHash])

  const entry = useSyncExternalStore(subscribe, getSnapshot, getSnapshot)

  useEffect(() => {
    if (enabled && queryFnRef.current) {
      const fn = queryFnRef.current
      client.fetchQuery(keyHash, fn, { staleTime }).catch(() => {
        // Handled in client cache entry state
      })
    }
  }, [client, keyHash, enabled, staleTime])

  const refetch = useCallback(() => {
    if (queryFnRef.current) {
      return client.fetchQuery(keyHash, queryFnRef.current, { staleTime: 0 })
    }
    return Promise.resolve(undefined)
  }, [client, keyHash])

  const hasData = entry?.data !== undefined
  const isLoading = enabled && !hasData && (entry?.isLoading ?? true)
  const error = entry?.error ?? null

  return {
    data: entry?.data,
    isLoading,
    error,
    refetch,
    isSuccess: hasData && !error,
    isError: !!error,
  }
}

export type ExtractFnReturnType<FnType extends (...args: never[]) => unknown> = Awaited<
  ReturnType<FnType>
>

export type QueryConfig<QueryFnType extends (...args: never[]) => unknown> = Omit<
  UseQueryOptions<ExtractFnReturnType<QueryFnType>>,
  'queryKey' | 'queryFn'
>

export type InfiniteQueryConfig<QueryFnType extends (...args: never[]) => unknown> = Omit<
  UseQueryOptions<ExtractFnReturnType<QueryFnType>>,
  'queryKey' | 'queryFn'
>
