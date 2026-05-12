import { useQuery } from '@tanstack/react-query'
import { ExtractFnReturnType, QueryConfig } from 'src/lib/react-query'
import { RemoteConfig } from '../types'

const getRemoteConfig = async (): Promise<RemoteConfig> => {
  const res = await fetch('/data/config.json')
  if (!res.ok) {
    throw new Error(`Failed to load config: ${res.status}`)
  }
  return res.json()
}

type QueryFnType = typeof getRemoteConfig

type UseGetRemoteConfigOptions = {
  config?: QueryConfig<QueryFnType>
}
export const useGetRemoteConfig = ({ config }: UseGetRemoteConfigOptions = {}) => {
  return useQuery<ExtractFnReturnType<QueryFnType>>({
    ...config,
    queryKey: ['remote-config', 'v4'],
    queryFn: () => getRemoteConfig(),
  })
}
