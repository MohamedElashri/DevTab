import { useCallback, useState } from 'react'
import { IoHeartCircle } from 'react-icons/io5'
import { Button, Modal } from 'src/components/Elements'
import { useAuth } from 'src/features/auth'
import './authModal.css'

type AuthModalProps = {
  showAuth: boolean
}

export const AuthModal = ({ showAuth }: AuthModalProps) => {
  const { closeAuthModal, authError, setAuthError } = useAuth()
  const [isLoading] = useState(false)

  const signIn = useCallback(async () => {
    setAuthError({
      message: 'Authentication is disabled in this fork.',
    })
  }, [setAuthError])

  return (
    <Modal
      showModal={showAuth}
      onClose={closeAuthModal}
      header={{
        className: 'header',
        title: 'Join Hackertab',
        icon: <IoHeartCircle style={{ fontSize: '1.2em' }} />,
      }}
      className="authModal">
      <div>
        <p className="description">Authentication has been disabled in this personal fork.</p>
        <div className="buttons">
          <Button
            isLoading={isLoading}
            onClick={() => signIn()}
            className="relative"
            size="medium">
            Sign In (Disabled)
          </Button>
        </div>
        {authError && (
          <div className="errors">
            <p>{authError.message}</p>
          </div>
        )}
      </div>
    </Modal>
  )
}
