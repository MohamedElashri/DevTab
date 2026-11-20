import { Button, Card, MenuItem } from 'src/components/Elements'
import { ListPostComponent } from 'src/components/List'
import { Link, useNavigate } from 'src/lib/router'
import { useUserPreferences } from 'src/stores/preferences'
import { CardPropsType } from 'src/types'
import { hasSubredditTemplate } from '../../api/redditFeed'
import { useLazyListLoad } from '../../hooks/useLazyListLoad'
import { useRedditFeed } from '../../hooks/useRedditFeed'
import { useSelectedTags } from '../../hooks/useSelectedTags'
import { ArticleCardItem } from '../ArticleCardItem'
import { MemoizedCardHeader } from '../CardHeader'
import { MemoizedCardSettings } from '../CardSettings'

const ALL_SUBREDDITS = { label: 'All Subreddits', value: '' }
const TECH_SUBREDDITS = { label: 'Tech', value: '' }

export function RedditCard(props: CardPropsType) {
  const { meta } = props
  const feedUrl = useUserPreferences((state) => state.redditFeedUrl)
  const key = useUserPreferences((state) => state.redlistenKey)
  const configured = Boolean(feedUrl || key)
  const fallbackTag = key || hasSubredditTemplate(feedUrl) ? TECH_SUBREDDITS : ALL_SUBREDDITS
  const { ref, isVisible } = useLazyListLoad()
  const { queryTags, selectedTag, cardSettings } = useSelectedTags({
    source: meta.value,
    fallbackTag,
  })
  const { current, isLoading } = useRedditFeed(feedUrl, key, queryTags, configured && isVisible)
  const isFiltered = queryTags.some(Boolean)
  const navigate = useNavigate()
  const removeCard = useUserPreferences((state) => state.removeCard)
  const setCardSettings = useUserPreferences((state) => state.setCardSettings)

  let content
  if (!configured) {
    content = (
      <div className="redditNotice">
        <h2>Reddit feed paused</h2>
        <p>Reddit ended public RSS access.</p>
        <p>
          <Link to="/settings/sources">Set up Reddit in Sources</Link> with a Redlisten key or an RSS feed URL.
        </p>
        <Button size="small" onClick={() => removeCard(meta.value)}>
          Disable Reddit card
        </Button>
      </div>
    )
  } else if (current && !current.posts.length && !current.error) {
    content = (
      <div className="redditNotice">
        {isFiltered ? (
          <>
            <p>No posts match the selected topic.</p>
            <Button size="small" onClick={() => setCardSettings(meta.value, { sortBy: '', language: '' })}>
              Show {fallbackTag.label}
            </Button>
          </>
        ) : (
          <p>No Reddit threads in the feed yet.</p>
        )}
      </div>
    )
  } else {
    content = (
      <>
        {current?.partial && <p className="redditFeedStatus" role="status">{current.error} Showing available posts.</p>}
        <ListPostComponent
          items={current?.posts}
          isLoading={isLoading}
          error={!current?.partial && current?.error ? new Error(current.error) : undefined}
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
      </>
    )
  }

  return (
    <Card
      {...props}
      ref={ref}
      titleComponent={configured && (
        <MemoizedCardHeader label={meta.label} fallbackTag={fallbackTag} selectedTag={selectedTag} />
      )}
      settingsComponent={
        <MemoizedCardSettings
          id={meta.value}
          url={meta.link}
          globalTag={fallbackTag}
          language={cardSettings?.language || fallbackTag.value}
          showLanguageFilter={configured}
          showDateRangeFilter={false}
          customStartMenuItems={configured && (
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
