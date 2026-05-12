import { useInfiniteQuery } from '@tanstack/react-query'
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
}

export const useGetFeed = ({ }: UseGetArticlesOptions) => {
  return useInfiniteQuery({
    queryKey: ['feed', 'v2'],
    queryFn: () => getFeed(),
    initialPageParam: undefined,
    getNextPageParam: () => undefined,
  })
}
