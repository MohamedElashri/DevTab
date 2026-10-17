import { ReactNode } from 'react'
import {
  BiCommentDetail,
  GoDotFill,
  MdAccessTime,
  VscTriangleUp,
} from 'src/components/Elements/Icons'
import { CardItemWithActions, CardLink, ClickableItem } from 'src/components/Elements'
import { useUserPreferences } from 'src/stores/preferences'
import { Article } from 'src/types'
import { formatTimeAgo } from 'src/utils/DateUtils'

export type ArticleCardItemProps = {
  item: Article
  analyticsTag: string
  sourceType?: 'rss' | 'supported'
  badgeClass?: string
  pointsLabel?: string
  canonicalFallback?: string
  extraDetails?: ReactNode
}

export const ArticleCardItem = ({
  item,
  analyticsTag,
  sourceType = 'supported',
  badgeClass,
  pointsLabel = 'points',
  canonicalFallback,
  extraDetails,
}: ArticleCardItemProps) => {
  const { listingMode } = useUserPreferences()

  return (
    <CardItemWithActions
      source={analyticsTag}
      sourceType={sourceType}
      item={item}
      cardItem={
        <>
          <p className="rowTitle">
            <CardLink link={item.url}>
              {listingMode === 'compact' && (
                <div className="counterWrapper">
                  <VscTriangleUp />
                  <span className="value">{item.points_count}</span>
                </div>
              )}
              <span className="subTitle">{item.title}</span>
            </CardLink>
          </p>

          {sourceType === 'rss' ? (
            <p className="rowDescription">
              <span className="rowItem" title={new Date(item.published_at).toUTCString()}>
                <MdAccessTime className="rowTitleIcon" />
                {formatTimeAgo(item.published_at)}
              </span>
            </p>
          ) : (
            listingMode === 'normal' && (
              <div className="rowDetails">
                <span className={`rowItem ${badgeClass || ''}`.trim()}>
                  <GoDotFill className="rowItemIcon" /> {item.points_count} {pointsLabel}
                </span>
                <span className="rowItem" title={new Date(item.published_at).toUTCString()}>
                  <MdAccessTime className="rowItemIcon" /> {formatTimeAgo(item.published_at)}
                </span>
                <ClickableItem
                  link={item.canonical_url || canonicalFallback || item.url}
                  className="rowItem rowItemClickable">
                  <BiCommentDetail className="rowItemIcon" /> {item.comments_count} comments
                </ClickableItem>
                {extraDetails}
              </div>
            )
          )}
        </>
      }
    />
  )
}
