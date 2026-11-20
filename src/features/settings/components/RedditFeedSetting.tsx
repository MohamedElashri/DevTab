import { type FormEvent, useState } from 'react'
import { Button } from 'src/components/Elements'
import { loadRedditFeed } from 'src/features/cards/api/loadRedditFeed'
import { resolveRedditFeedUrl, TECH_SUBREDDITS } from 'src/features/cards/api/redditFeed'
import { useUserPreferences } from 'src/stores/preferences'
import { requestHostPermission } from 'src/utils/ensureExtensionPermissions'

export function RedditFeedSetting() {
  const feedUrl = useUserPreferences((state) => state.redditFeedUrl)
  const setRedditFeed = useUserPreferences((state) => state.setRedditFeed)
  const [draft, setDraft] = useState<string>()
  const [feedback, setFeedback] = useState('')
  const [isSaving, setIsSaving] = useState(false)

  const saveFeed = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const input = (draft ?? feedUrl ?? '').trim()
    let url: string
    try {
      url = resolveRedditFeedUrl(input, TECH_SUBREDDITS[0])
    } catch (error) {
      setFeedback(error instanceof TypeError
        ? 'Enter a full RSS feed URL starting with https:// or http://.'
        : (error as Error).message)
      return
    }

    setIsSaving(true)
    setFeedback('')
    try {
      if (!(await requestHostPermission(url))) {
        setFeedback('Grant permission to load the Reddit RSS feed.')
        return
      }

      const feed = await loadRedditFeed({ url })
      if (feed.error) {
        setFeedback(feed.error)
        return
      }
      setRedditFeed({ url: input.split('#')[0] })
      setDraft(undefined)
      setFeedback('Reddit RSS feed saved.')
    } catch {
      setFeedback('Could not load the Reddit RSS feed.')
    } finally {
      setIsSaving(false)
    }
  }

  const removeFeed = () => {
    setRedditFeed()
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
        <p className="settingHint">Use a combined feed URL or put {'{subreddit}'} in a single-subreddit URL to follow topics.</p>
        {feedback && <p className="settingHint" role="status">{feedback}</p>}
      </div>
    </div>
  )
}
