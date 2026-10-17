import { BaseModal } from 'src/components/Elements'
import { HelloTab } from './steps/HelloTab'
import './steps/tabs.css'

export const OnboardingModal = () => {
  return (
    <BaseModal
      isOpen={true}
      shouldCloseOnEsc={false}
      shouldCloseOnOverlayClick={false}
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
    </BaseModal>
  )
}
