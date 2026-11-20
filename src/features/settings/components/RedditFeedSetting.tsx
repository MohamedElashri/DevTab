import { type FormEvent, useState } from 'react'
import { Button } from 'src/components/Elements'
import { getRssUrlFeed } from 'src/features/cards/api/getRssFeed'
import { useUserPreferences } from 'src/stores/preferences'
import { requestHostPermission } from 'src/utils/ensureExtensionPermissions'

export function RedditFeedSetting() {
  const feedUrl = useUserPreferences((state) => state.redditFeedUrl)
  const setRedditFeedUrl = useUserPreferences((state) => state.setRedditFeedUrl)
  const [draft, setDraft] = useState<string>()
  const [feedback, setFeedback] = useState('')
  const [isSaving, setIsSaving] = useState(false)

  const saveFeed = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    let url: URL
    try {
      url = new URL((draft ?? feedUrl ?? '').trim())
    } catch {
      setFeedback('Enter a full RSS feed URL starting with https:// or http://.')
      return
    }
    if (!/^https?:$/.test(url.protocol) || url.username || url.password) {
      setFeedback('Enter an HTTP or HTTPS feed URL without a username or password.')
      return
    }

    setIsSaving(true)
    setFeedback('')
    try {
      if (!(await requestHostPermission(url.href))) {
        setFeedback('Grant permission to load the Reddit RSS feed.')
        return
      }

      await getRssUrlFeed(url.href)
      setRedditFeedUrl(url.href)
      setDraft(undefined)
      setFeedback('Reddit RSS feed saved.')
    } catch (error) {
      setFeedback(error instanceof Error ? error.message : 'Could not load the Reddit RSS feed.')
    } finally {
      setIsSaving(false)
    }
  }

  const removeFeed = () => {
    setRedditFeedUrl(undefined)
    setDraft(undefined)
    setFeedback('Reddit RSS feed removed.')
  }

  return (
    <div className="settingRow">
      <label className="settingTitle" htmlFor="reddit-feed-url">Reddit RSS Feed URL</label>
      <div className="settingContent">
        <form className="form rssForm" onSubmit={saveFeed}>
          <input
            id="reddit-feed-url"
            type="text"
            inputMode="url"
            autoComplete="off"
            spellCheck={false}
            disabled={isSaving}
            value={draft ?? feedUrl ?? ''}
            onChange={(event) => setDraft(event.target.value)}
            placeholder="https://example.com/reddit.xml"
          />
          <button type="submit" className="button small" disabled={isSaving}>
            {isSaving ? 'Saving…' : 'Save'}
          </button>
          {feedUrl && (
            <Button size="small" isLoading={isSaving} onClick={removeFeed}>
              Remove
            </Button>
          )}
        </form>
        {feedback && <p className="settingHint" role="status">{feedback}</p>}
      </div>
    </div>
  )
}
