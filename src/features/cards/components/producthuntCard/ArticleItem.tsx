import { BiCommentDetail } from 'react-icons/bi'
import { SiProducthunt } from 'react-icons/si'
import { CardItemWithActions, CardLink } from 'src/components/Elements'
import { useUserPreferences } from 'src/stores/preferences'
import { BaseItemPropsType, Product } from 'src/types'

const ArticleItem = ({ item, analyticsTag }: BaseItemPropsType<Product>) => {
  const { listingMode } = useUserPreferences()

  return (
    <CardItemWithActions
      source={analyticsTag}
      item={{ ...item, title: item.title }}
      cardItem={
        <div className="phItem">
          {item.image_url ? (
            <img className="phImage" loading="lazy" src={item.image_url} alt={item.title} />
          ) : (
            <div className="phImage phImageFallback">
              <SiProducthunt />
            </div>
          )}
          <div className="phContent">
            <CardLink link={item.url}>{item.title}</CardLink>
            {item.tagline && <p className="rowDescription">{item.tagline}</p>}

            {listingMode === 'normal' && (
              <p className="rowDetails">
                <span className="rowItem">
                  <BiCommentDetail className="rowItemIcon" /> Product Hunt
                </span>
                {item.tags[0] && <span className="rowItem">{item.tags[0]}</span>}
              </p>
            )}
          </div>
        </div>
      }
    />
  )
}

export default ArticleItem
