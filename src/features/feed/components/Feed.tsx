import useInfiniteScroll from 'react-infinite-scroll-hook'
import { PropagateLoader } from 'react-spinners'
import { useGetFeed } from 'src/features/cards'
import './feed.css'
import { FeedItem } from './feedItems/FeedItem'

export const Feed = () => {
  const {
    data: feed,
    isLoading,
    isInitialLoading,
    hasNextPage,
    isError,
    error,
    fetchNextPage,
  } = useGetFeed()

  const [infiniteRef, { rootRef }] = useInfiniteScroll({
    loading: isLoading,
    hasNextPage: Boolean(hasNextPage),
    onLoadMore: () => {
      fetchNextPage()
    },
    disabled: Boolean(error),
    rootMargin: '0px 0px 100% 0px',
  })

  if (isInitialLoading) {
    return (
      <div className="feed feedLoading">
        {Array.from({
          length: 10,
        }).map((_, index) => (
          <div className="feedItem placeholder" key={`loading-${index}`}>
            <div className="image"></div>
            <div className="line"></div>
            <div className="smallLine"></div>
          </div>
        ))}
      </div>
    )
  }

  return (
    <div ref={rootRef} className="feed scrollable" style={{ overflow: 'auto', maxHeight: '100%' }}>
      {(feed?.pages.flatMap((page) => page.data) || []).map((article) => {
        return (
          <FeedItem item={article} key={article.id} analyticsTag={'feed'} className="feedItem" />
        )
      })}
      {hasNextPage && (
        <div className="feedLoading" ref={infiniteRef}>
          <PropagateLoader color={'#A9B2BD'} loading={true} size={8} />
        </div>
      )}
      {isError && <div className="errorMsg">Error while loading feed</div>}
    </div>
  )
}
