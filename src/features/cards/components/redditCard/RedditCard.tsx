import { BsArrowReturnRight, VscTriangleUp } from 'src/components/Elements/Icons'
import { Card } from 'src/components/Elements'
import { ListPostComponent } from 'src/components/List'

import { useCallback } from 'react'
import { Article, CardPropsType } from 'src/types'
import { useGetSourceArticles } from '../../api/getSourceArticles'
import { useLazyListLoad } from '../../hooks/useLazyListLoad'
import { useSelectedTags } from '../../hooks/useSelectedTags'
import { ArticleCardItem } from '../ArticleCardItem'
import { MemoizedCardHeader } from '../CardHeader'
import { MemoizedCardSettings } from '../CardSettings'

const GLOBAL_TAG = { label: 'Tech', value: '' }

export function RedditCard(props: CardPropsType) {
  const { meta } = props
  const { ref, isVisible } = useLazyListLoad()
  const {
    queryTags,
    selectedTag,
    cardSettings: { sortBy, language } = {},
  } = useSelectedTags({
    source: meta.value,
    fallbackTag: GLOBAL_TAG,
  })
  const { isLoading, data: results, error } = useGetSourceArticles({
    source: 'reddit',
    tags: queryTags,
    config: {
      enabled: isVisible,
    },
  })

  const renderItem = useCallback(
    (item: Article) => {
      const parts = item.url.split('/')
      const rIndex = parts.findIndex((part) => part.toLowerCase() === 'r')
      const subReddit = rIndex !== -1 && parts.length > rIndex + 1 ? parts[rIndex + 1] : null

      return (
        <ArticleCardItem
          key={item.id}
          item={item}
          analyticsTag={meta.analyticsTag}
          badgeClass="redditRowItem"
          pointsLabel="upvotes"
          extraDetails={
            subReddit ? (
              <span className="rowItem">
                <BsArrowReturnRight className="rowItemIcon" /> {`r/${subReddit}`}
              </span>
            ) : null
          }
        />
      )
    },
    [meta.analyticsTag]
  )

  return (
    <Card
      ref={ref}
      titleComponent={
        <MemoizedCardHeader label={meta.label} fallbackTag={GLOBAL_TAG} selectedTag={selectedTag} />
      }
      {...props}
      settingsComponent={
        <MemoizedCardSettings
          url={meta.link}
          id={meta.value}
          globalTag={GLOBAL_TAG}
          sortBy={sortBy}
          language={language || GLOBAL_TAG.value}
          sortOptions={(defaults) => [
            ...defaults,
            {
              label: 'Upvotes',
              value: 'points_count',
              icon: <VscTriangleUp />,
            },
          ]}
        />
      }>
      <ListPostComponent
        sortBy={sortBy as keyof Article}
        items={results}
        error={error}
        isLoading={isLoading}
        renderItem={renderItem}
      />
    </Card>
  )
}
