import { useQuery } from '@tanstack/react-query'
import { ExtractFnReturnType, QueryConfig } from 'src/lib/react-query'
import { Version } from '../types'

const getVersions = async (): Promise<Version[]> => {
  const res = await fetch('https://api.github.com/repos/medyo/hackertab.dev/releases')
  if (!res.ok) {
    throw new Error('Failed to fetch versions')
  }
  return res.json()
}

type QueryFnType = typeof getVersions

type UseGetVersionsOptions = {
  config?: QueryConfig<QueryFnType>
}
export const useGetVersions = ({ config }: UseGetVersionsOptions = {}) => {
  return useQuery<ExtractFnReturnType<QueryFnType>>({
    ...config,
    queryKey: ['versions'],
    queryFn: () => getVersions(),
  })
}
