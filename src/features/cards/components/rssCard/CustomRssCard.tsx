import { useCallback } from 'react'
import { Card } from 'src/components/Elements'
import { ListPostComponent } from 'src/components/List'
import { Article, CardPropsType } from 'src/types'
import { useRssFeed } from '../../api/getRssFeed'
import { useLazyListLoad } from '../../hooks/useLazyListLoad'
import { ArticleCardItem } from '../ArticleCardItem'
import { MemoizedCardSettings } from '../CardSettings'
import CardIcon from './CardIcon'

const HeaderTitle = ({ title }: { title: string }) => {
  return <p className="maxTitle">{title}</p>
}

export function CustomRssCard(props: CardPropsType) {
  const { meta } = props
  const { ref, isVisible } = useLazyListLoad()
  const { data = [], isLoading, error } = useRssFeed({
    feedUrl: meta.feedUrl || '',
    config: {
      enabled: isVisible && Boolean(meta.feedUrl),
    },
  })

  const renderItem = useCallback(
    (item: Article) => (
      <ArticleCardItem
        key={item.id}
        item={item}
        analyticsTag={meta.analyticsTag}
        sourceType="rss"
      />
    ),
    [meta.analyticsTag]
  )

  return (
    <Card
      ref={ref}
      titleComponent={<HeaderTitle title={meta.label} />}
      {...props}
      meta={{ ...meta, icon: <CardIcon url={meta.icon as string | undefined} /> }}
      settingsComponent={
        <MemoizedCardSettings
          url={meta.link}
          id={meta.value}
          showDateRangeFilter={false}
          showLanguageFilter={false}
        />
      }>
      <ListPostComponent
        items={data}
        error={error}
        isLoading={isLoading}
        renderItem={renderItem}
      />
    </Card>
  )
}
