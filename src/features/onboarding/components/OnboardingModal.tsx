import { useEffect } from 'react'
import ReactModal from 'react-modal'
import { HelloTab } from './steps/HelloTab'
import './steps/tabs.css'

export const OnboardingModal = () => {
  useEffect(() => {
    // Onboarding started - no analytics
  }, [])

  return (
    <ReactModal
      isOpen={true}
      ariaHideApp={false}
      shouldCloseOnEsc={false}
      shouldCloseOnOverlayClick={false}
      shouldFocusAfterRender={false}
      contentLabel="Onboarding"
      className="Modal scrollable"
      style={{
        overlay: {
          zIndex: 3,
        },
      }}
      overlayClassName="Overlay">
      <div className="onboardingModal">
        <HelloTab />
      </div>
    </ReactModal>
  )
}
