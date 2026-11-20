import { type FormEvent, useState } from 'react'
import { loadRedditFeed } from '../../api/loadRedditFeed'
import { REDLISTEN_DASHBOARD, REDLISTEN_ORIGIN, redlistenFeedRequest, TECH_SUBREDDITS } from '../../api/redditFeed'
import { useUserPreferences } from 'src/stores/preferences'
import { requestHostPermission } from 'src/utils/ensureExtensionPermissions'

export function RedlistenKeyForm({ onFinished }: { onFinished?: () => void }) {
  const savedKey = useUserPreferences((state) => state.redlistenKey)
  const setRedditFeed = useUserPreferences((state) => state.setRedditFeed)
  const [draft, setDraft] = useState('')
  const [saving, setSaving] = useState(false)
  const [feedback, setFeedback] = useState('')

  const save = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const key = draft.trim()
    if (!/^rl_live_[a-z0-9_-]+$/i.test(key)) {
      setFeedback('Copy a key starting with rl_live_ from your Redlisten dashboard.')
      return
    }

    setSaving(true)
    setFeedback('')
    try {
      if (!(await requestHostPermission(REDLISTEN_ORIGIN))) {
        setFeedback('Grant permission to load posts from Redlisten.')
        return
      }

      const feed = await loadRedditFeed(redlistenFeedRequest(TECH_SUBREDDITS[0], key))
      if (feed.error) {
        setFeedback(/HTTP (401|403)$/.test(feed.error) ? 'Redlisten rejected this key. Check it in your dashboard.' : feed.error)
        return
      }

      setRedditFeed({ key })
      setDraft('')
      setFeedback('Redlisten key saved.')
      onFinished?.()
    } catch {
      setFeedback('Could not connect to Redlisten.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="redditKeyForm">
      <p>Create a free Redlisten account, then copy the API key from your dashboard. DevTab stores the key in this browser and refreshes each subreddit at most once every 24 hours.</p>
      <a href={REDLISTEN_DASHBOARD} target="_blank" rel="noreferrer">Get a free Redlisten key</a>
      <form onSubmit={save}>
        <label htmlFor="redlisten-api-key">Redlisten API key</label>
        <input
          id="redlisten-api-key"
          type="password"
          autoComplete="off"
          spellCheck={false}
          placeholder={savedKey ? 'Key saved' : 'rl_live_…'}
          value={draft}
          disabled={saving}
          onChange={(event) => setDraft(event.target.value)}
        />
        <div className="redditKeyActions">
          <button type="submit" className="button small" disabled={saving}>
            {saving ? 'Checking key…' : savedKey ? 'Replace key' : 'Save key'}
          </button>
          {onFinished ? (
            <button type="button" className="button small" disabled={saving} onClick={onFinished}>
              Skip for now
            </button>
          ) : savedKey && (
            <button type="button" className="button small" disabled={saving} onClick={() => {
              setRedditFeed()
              setDraft('')
              setFeedback('Redlisten key removed.')
            }}>
              Remove key
            </button>
          )}
        </div>
        {feedback && <p role="status">{feedback}</p>}
      </form>
    </div>
  )
}
