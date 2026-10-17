import { useCallback } from 'react'
import { BiSolidCircle } from 'src/components/Elements/Icons'
import { Card } from 'src/components/Elements'
import { ListPostComponent } from 'src/components/List'
import { useUserPreferences } from 'src/stores/preferences'
import { Article, CardPropsType } from 'src/types'
import { useShallow } from 'src/lib/store'
import { useGetSourceArticles } from '../../api/getSourceArticles'
import { useLazyListLoad } from '../../hooks/useLazyListLoad'
import { ArticleCardItem } from '../ArticleCardItem'
import { MemoizedCardSettings } from '../CardSettings'

export function LobstersCard(props: CardPropsType) {
  const { meta } = props
  const { ref, isVisible } = useLazyListLoad()
  const sortBy = useUserPreferences(
    useShallow((state) => state.cardsSettings?.[meta.value]?.sortBy)
  )
  const { data, isLoading, error } = useGetSourceArticles({
    source: 'lobsters',
    config: {
      enabled: isVisible,
    },
  })

  const renderItem = useCallback(
    (item: Article) => (
      <ArticleCardItem
        key={item.id}
        item={item}
        analyticsTag={meta.analyticsTag}
        badgeClass="lobstersRowItem"
      />
    ),
    [meta.analyticsTag]
  )

  return (
    <Card
      ref={ref}
      {...props}
      settingsComponent={
        <MemoizedCardSettings
          url={meta.link}
          id={meta.value}
          showLanguageFilter={false}
          sortBy={sortBy}
          sortOptions={(defaults) => [
            ...defaults,
            {
              label: 'Points',
              value: 'points_count',
              icon: <BiSolidCircle />,
            },
          ]}
        />
      }>
      <ListPostComponent
        sortBy={sortBy as keyof Article}
        items={data}
        error={error}
        isLoading={isLoading}
        renderItem={renderItem}
      />
    </Card>
  )
}
