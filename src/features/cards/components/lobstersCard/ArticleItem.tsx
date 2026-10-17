import { BiCommentDetail } from 'src/components/Elements/Icons'
import { GoDotFill } from 'src/components/Elements/Icons'
import { MdAccessTime } from 'src/components/Elements/Icons'
import { VscTriangleUp } from 'src/components/Elements/Icons'
import { CardItemWithActions, CardLink, ClickableItem } from 'src/components/Elements'
import { useUserPreferences } from 'src/stores/preferences'
import { Article, BaseItemPropsType } from 'src/types'
import { formatTimeAgo } from 'src/utils/DateUtils'

const ArticleItem = ({ item, analyticsTag }: BaseItemPropsType<Article>) => {
  const { listingMode } = useUserPreferences()

  return (
    <CardItemWithActions
      source={analyticsTag}
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
          {listingMode === 'normal' && (
            <div className="rowDetails">
              <span className="rowItem lobstersRowItem">
                <GoDotFill className="rowItemIcon" /> {item.points_count} points
              </span>
              <span className="rowItem" title={new Date(item.published_at).toUTCString()}>
                <MdAccessTime className="rowItemIcon" /> {formatTimeAgo(item.published_at)}
              </span>
              <ClickableItem
                link={item.canonical_url || item.url}
                className="rowItem rowItemClickable">
                <BiCommentDetail className="rowItemIcon" /> {item.comments_count} comments
              </ClickableItem>
            </div>
          )}
        </>
      }
    />
  )
}

export default ArticleItem
