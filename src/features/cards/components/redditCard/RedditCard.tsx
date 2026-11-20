import { useMemo } from 'react'
import { Button, Card, MenuItem } from 'src/components/Elements'
import { ListPostComponent } from 'src/components/List'
import { Link, useNavigate } from 'src/lib/router'
import { useUserPreferences } from 'src/stores/preferences'
import { CardPropsType } from 'src/types'
import { getRedditFeedItems } from '../../api/redditFeed'
import { useRssFeed } from '../../api/getRssFeed'
import { useLazyListLoad } from '../../hooks/useLazyListLoad'
import { useSelectedTags } from '../../hooks/useSelectedTags'
import { ArticleCardItem } from '../ArticleCardItem'
import { MemoizedCardHeader } from '../CardHeader'
import { MemoizedCardSettings } from '../CardSettings'

const ALL_SUBREDDITS = { label: 'All Subreddits', value: '' }

export function RedditCard(props: CardPropsType) {
  const { meta } = props
  const feedUrl = useUserPreferences((state) => state.redditFeedUrl)
  const { ref, isVisible } = useLazyListLoad()
  const { queryTags, selectedTag, cardSettings } = useSelectedTags({
    source: meta.value,
    fallbackTag: ALL_SUBREDDITS,
  })
  const { data, isLoading, error } = useRssFeed({
    feedUrl: feedUrl || '',
    config: { enabled: Boolean(feedUrl) && isVisible },
  })
  const items = useMemo(() => getRedditFeedItems(data || [], queryTags), [data, queryTags])
  const isFiltered = queryTags.some(Boolean)
  const navigate = useNavigate()
  const removeCard = useUserPreferences((state) => state.removeCard)
  const setCardSettings = useUserPreferences((state) => state.setCardSettings)

  let content
  if (!feedUrl) {
    content = (
      <div className="redditNotice">
        <h2>Reddit feed paused</h2>
        <p>Reddit ended public RSS access. I’m working on a solution.</p>
        <p>
          In the meantime,{' '}
          <a
            href="https://ifttt.com/applets/f6maSFd9-new-posts-from-a-reddit-subreddit-added-to-rss-ground-personal-feed-rss"
            target="_blank"
            rel="noreferrer">
            set up a feed with IFTTT and RSS Ground
          </a>{' '}
          and <Link to="/settings/sources">add its RSS URL in Sources</Link>.
        </p>
        <Button size="small" onClick={() => removeCard(meta.value)}>
          Disable Reddit card
        </Button>
      </div>
    )
  } else if (data && !items.length && !error) {
    content = (
      <div className="redditNotice">
        {isFiltered ? (
          <>
            <p>No posts match the selected topic.</p>
            <Button size="small" onClick={() => setCardSettings(meta.value, { sortBy: '', language: '' })}>
              Show all subreddits
            </Button>
          </>
        ) : (
          <p>No Reddit threads in the feed yet. Map IFTTT’s PostURL to the RSS item link.</p>
        )}
      </div>
    )
  } else {
    content = (
      <ListPostComponent
        items={items}
        isLoading={isLoading}
        error={error}
        sortBy="published_at"
        renderItem={(item) => (
          <ArticleCardItem
            key={item.id}
            item={item}
            analyticsTag={meta.analyticsTag}
            showDiscussionStats={false}
            extraDetails={<span className="rowItem">r/{item.tags[0]}</span>}
          />
        )}
      />
    )
  }

  return (
    <Card
      {...props}
      ref={ref}
      titleComponent={feedUrl && (
        <MemoizedCardHeader label={meta.label} fallbackTag={ALL_SUBREDDITS} selectedTag={selectedTag} />
      )}
      settingsComponent={
        <MemoizedCardSettings
          id={meta.value}
          url={meta.link}
          globalTag={ALL_SUBREDDITS}
          language={cardSettings?.language || ALL_SUBREDDITS.value}
          showLanguageFilter={Boolean(feedUrl)}
          showDateRangeFilter={false}
          customStartMenuItems={feedUrl && (
            <MenuItem className="menuItem" onClick={() => navigate('/settings/sources')}>
              RSS feed settings
            </MenuItem>
          )}
        />
      }>
      {content}
    </Card>
  )
}
