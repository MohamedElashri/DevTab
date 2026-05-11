import { useInfiniteQuery } from '@tanstack/react-query'
import { InfiniteQueryConfig } from 'src/lib/react-query'
import { FeedItemData } from 'src/types'

// Feed aggregation removed in personal fork. Returning empty feed.
type Response = {
  data: FeedItemData[]
  metadata: {
    next: string | null
    hasNextPage: boolean
  }
}

const getFeed = async (): Promise<Response> => {
  return {
    data: [],
    metadata: { next: null, hasNextPage: false },
  }
}

type UseGetArticlesOptions = {
  tags: string[]
  config?: InfiniteQueryConfig<typeof getFeed>
}

export const useGetFeed = ({ config }: UseGetArticlesOptions) => {
  return useInfiniteQuery<Response>({
    ...config,
    queryKey: ['feed', 'v2'],
    queryFn: () => getFeed(),
    getNextPageParam: () => undefined,
  })
}
