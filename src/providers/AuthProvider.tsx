import { useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useAuth } from 'src/features/auth'
import { OAUTH_ERRORS } from 'src/features/auth/constants'

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const {
    setAuthError,
    openAuthModal,
  } = useAuth()

  /**
   * This effect is used to handle errors from the URL on the web
   */
  useEffect(() => {
    const error = searchParams.get('error')

    if (!error) {
      return
    }

    setAuthError({
      message: OAUTH_ERRORS[error] || OAUTH_ERRORS['default'],
    })
    openAuthModal()
    navigate(window.location.pathname, { replace: true })
  }, [searchParams])

  return <>{children}</>
}
