import { Button, Card, MenuItem } from 'src/components/Elements'
import { ListPostComponent } from 'src/components/List'
import { Link, useNavigate } from 'src/lib/router'
import { useUserPreferences } from 'src/stores/preferences'
import { CardPropsType } from 'src/types'
import { normalizeRedditPostLimit } from '../../api/redditFeed'
import { REDDIT_TECH_OPTION } from '../../config'
import { useLazyListLoad } from '../../hooks/useLazyListLoad'
import { useRedditFeed } from '../../hooks/useRedditFeed'
import { useSelectedTags } from '../../hooks/useSelectedTags'
import { ArticleCardItem } from '../ArticleCardItem'
import { MemoizedCardHeader } from '../CardHeader'
import { MemoizedCardSettings } from '../CardSettings'

export function RedditCard(props: CardPropsType) {
  const { meta } = props
  const key = useUserPreferences((state) => state.redlistenKey)
  const postLimit = useUserPreferences((state) => normalizeRedditPostLimit(state.redditPostLimit))
  const configured = Boolean(key)
  const fallbackTag = REDDIT_TECH_OPTION
  const { ref, isVisible } = useLazyListLoad()
  const { queryTags, selectedTag, cardSettings } = useSelectedTags({
    source: meta.value,
    fallbackTag,
  })
  const { current, isLoading } = useRedditFeed(key, queryTags, postLimit, isVisible)
  const isFiltered = queryTags.some(Boolean)
  const navigate = useNavigate()
  const removeCard = useUserPreferences((state) => state.removeCard)
  const setCardSettings = useUserPreferences((state) => state.setCardSettings)

  let content
  if (!configured) {
    content = (
      <div className="redditNotice">
        <h2>Reddit feed paused</h2>
        <p>Add a free Redlisten key to see recent posts from the topics you follow.</p>
        <Link className="button small" to="/settings/sources">Set up Reddit</Link>
        <Button className="redditSecondaryAction" size="small" onClick={() => removeCard(meta.value)}>
          Disable Reddit card
        </Button>
      </div>
    )
  } else if (current && !current.posts.length && !current.error) {
    content = (
      <div className="redditNotice">
        {isFiltered ? (
          <>
            <p>Redlisten has no recent posts for your selected topics.</p>
            <Button size="small" onClick={() => setCardSettings(meta.value, { sortBy: '', language: '' })}>
              Show {fallbackTag.label}
            </Button>
          </>
        ) : (
          <p>Redlisten has no recent posts for this feed.</p>
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
          limit={postLimit}
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
          customStartMenuItems={
            <MenuItem className="menuItem" onClick={() => navigate('/settings/sources')}>
              Reddit settings
            </MenuItem>
          }
        />
      }>
      {content}
    </Card>
  )
}
