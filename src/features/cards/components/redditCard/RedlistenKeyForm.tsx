import { type FormEvent, useState } from 'react'
import { loadRedditFeed } from '../../api/loadRedditFeed'
import { parseRedlistenKey, REDLISTEN_DASHBOARD, REDLISTEN_ORIGIN, redlistenFeedRequest } from '../../api/redditFeed'
import { REDDIT_TECH_OPTION } from '../../config'
import { useSelectedTags } from '../../hooks/useSelectedTags'
import { useUserPreferences } from 'src/stores/preferences'
import { requestHostPermission } from 'src/utils/ensureExtensionPermissions'

export function RedlistenKeyForm({ onFinished }: { onFinished?: () => void }) {
  const savedKey = useUserPreferences((state) => state.redlistenKey)
  const postLimit = useUserPreferences((state) => state.redditPostLimit)
  const setRedlistenKey = useUserPreferences((state) => state.setRedlistenKey)
  const { queryTags } = useSelectedTags({ source: 'reddit', fallbackTag: REDDIT_TECH_OPTION })
  const [saving, setSaving] = useState(false)
  const [feedback, setFeedback] = useState('')

  const save = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const form = event.currentTarget
    const input = new FormData(form).get('redlistenKey')
    const key = typeof input === 'string' ? parseRedlistenKey(input) : undefined
    if (!key) {
      setFeedback('Enter the full API key from your Redlisten dashboard.')
      return
    }

    setSaving(true)
    setFeedback('')
    try {
      if (!(await requestHostPermission(REDLISTEN_ORIGIN))) {
        setFeedback('Grant permission to load posts from Redlisten.')
        return
      }

      const feed = await loadRedditFeed(redlistenFeedRequest(queryTags, key, postLimit))
      if (feed.error) {
        setFeedback(feed.error)
        return
      }

      setRedlistenKey(key)
      form.reset()
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
      {!savedKey && (
        <p>
          <a href={REDLISTEN_DASHBOARD} target="_blank" rel="noreferrer">Get a free Redlisten key</a>
          {' '}and paste it below. DevTab saves it in this browser.
        </p>
      )}
      <form onSubmit={save}>
        <label htmlFor="redlisten-api-key">Redlisten API key</label>
        <input
          id="redlisten-api-key"
          name="redlistenKey"
          type="password"
          autoComplete="off"
          autoCapitalize="none"
          spellCheck={false}
          placeholder={savedKey ? 'Paste a new key to replace it' : 'Paste API key'}
          aria-describedby="redlisten-key-status"
          disabled={saving}
        />
        <div className="redditKeyActions">
          <button type="submit" className="button small" disabled={saving}>
            {saving ? 'Checking key…' : savedKey ? 'Replace key' : 'Save key'}
          </button>
          {onFinished ? (
            <button type="button" className="button small redditSecondaryAction" disabled={saving} onClick={onFinished}>
              Skip for now
            </button>
          ) : savedKey && (
            <button type="button" className="button small redditSecondaryAction" disabled={saving} onClick={(event) => {
              setRedlistenKey()
              event.currentTarget.form?.reset()
              setFeedback('Redlisten key removed.')
            }}>
              Remove key
            </button>
          )}
        </div>
        <p id="redlisten-key-status" role="status">
          {feedback || (savedKey ? 'A Redlisten key is saved in this browser.' : '')}
        </p>
      </form>
    </div>
  )
}
