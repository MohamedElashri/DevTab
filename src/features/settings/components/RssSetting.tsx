import { useState } from 'react'
import { BsRssFill } from 'src/components/Elements/Icons'
import { Button } from 'src/components/Elements'
import { getRssUrlFeed } from 'src/features/cards'
import { useUserPreferences } from 'src/stores/preferences'
import { SupportedCardType } from 'src/types'
import { isValidURL } from 'src/utils/UrlUtils'
import { requestHostPermission } from 'src/utils/ensureExtensionPermissions'

const normalizeFeedUrl = (value: string) => {
  const trimmed = value.trim()
  return /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`
}

const slugify = (value: string) => {
  return value
    .toLowerCase()
    .trim()
    .replace(/https?:\/\//, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

const getUniqueValue = (baseValue: string, existingCards: SupportedCardType[]) => {
  let value = baseValue || 'rss-feed'
  let index = 2

  while (existingCards.some((card) => card.value === value)) {
    value = `${baseValue}-${index}`
    index += 1
  }

  return value
}

export const RssSetting = () => {
  const { cards, setCards, userCustomCards, setUserCustomCards } = useUserPreferences()
  const [rssUrl, setRssUrl] = useState('')
  const [feedback, setFeedback] = useState<string | undefined>()
  const [isLoading, setIsLoading] = useState(false)

  const onRssAddClick = async () => {
    const feedUrl = normalizeFeedUrl(rssUrl)

    if (!rssUrl.trim()) {
      setFeedback('Please provide an RSS Feed URL.')
      return
    }

    if (!isValidURL(feedUrl)) {
      setFeedback('Invalid RSS Feed URL. Please check and try again.')
      return
    }

    setIsLoading(true)
    setFeedback(undefined)

    try {
      const granted = await requestHostPermission(feedUrl)
      if (!granted) {
        setFeedback('Permission is required to load that RSS feed in the extension.')
        return
      }

      const info = await getRssUrlFeed(feedUrl)
      const existingCards = [...userCustomCards]

      if (existingCards.some((card) => card.feedUrl === feedUrl || card.link === info.link)) {
        setFeedback('RSS Feed already exists.')
        return
      }

      const value = getUniqueValue(slugify(info.title || feedUrl), existingCards)
      const customCard: SupportedCardType = {
        feedUrl,
        label: info.title,
        value,
        analyticsTag: value,
        link: info.link,
        type: 'rss',
        icon: info.icon,
      }

      setUserCustomCards([...userCustomCards, customCard])
      setCards([...cards, { id: cards.length, name: customCard.value, type: customCard.type }])
      setRssUrl('')
      setFeedback('RSS Feed added.')
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Error occurred. Please check and try again.'
      setFeedback(message)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="settingRow">
      <p className="settingTitle">RSS Feed URL</p>
      <div className="settingContent">
        <div className="form rssForm">
          <input
            type="text"
            value={rssUrl}
            onChange={(e) => setRssUrl(e.target.value)}
            placeholder="https://example.com/rss.xml"
          />
          <Button
            startIcon={<BsRssFill />}
            size="small"
            className="rssButton"
            isLoading={isLoading}
            onClick={onRssAddClick}>
            Add
          </Button>
        </div>
        {feedback && (
          <div className="settingHint">
            <p>{feedback}</p>
          </div>
        )}
      </div>
    </div>
  )
}
