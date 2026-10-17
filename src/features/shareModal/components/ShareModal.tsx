import React from 'react'
import { FaLinkedinIn } from 'src/components/Elements/Icons'
import { MdEmail } from 'src/components/Elements/Icons'
import { SiFacebook, SiReddit, SiTelegram, SiWhatsapp, SiX } from 'src/components/Elements/Icons'
import { VscClose, VscCopy } from 'src/components/Elements/Icons'
import { Button, BaseModal } from 'src/components/Elements'
import toast from 'src/utils/toast'
import { ShareModalData } from '../types'
import './share.css'

type ShareModalProps = {
  showModal: boolean
  closeModal: () => void
  shareData: ShareModalData | undefined
}

type SharePlatform = {
  name: string
  label: string
  bg: string
  icon: React.ReactNode
  getUrl: (url: string, title: string) => string
}

const sharingPlatforms: SharePlatform[] = [
  {
    name: 'email',
    label: 'Share via Email',
    bg: '#7f7f7f',
    icon: <MdEmail size={20} color="#ffffff" />,
    getUrl: (url, title) => `mailto:?subject=${encodeURIComponent(title)}&body=${encodeURIComponent(url)}`,
  },
  {
    name: 'facebook',
    label: 'Share on Facebook',
    bg: '#1877f2',
    icon: <SiFacebook size={18} color="#ffffff" />,
    getUrl: (url) => `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
  },
  {
    name: 'twitter',
    label: 'Share on X',
    bg: '#000000',
    icon: <SiX size={18} color="#ffffff" />,
    getUrl: (url, title) => `https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(`${title} via @devtab`)}`,
  },
  {
    name: 'reddit',
    label: 'Share on Reddit',
    bg: '#ff4500',
    icon: <SiReddit size={20} color="#ffffff" />,
    getUrl: (url, title) => `https://reddit.com/submit?url=${encodeURIComponent(url)}&title=${encodeURIComponent(title)}`,
  },
  {
    name: 'linkedin',
    label: 'Share on LinkedIn',
    bg: '#0077b5',
    icon: <FaLinkedinIn size={18} color="#ffffff" />,
    getUrl: (url) => `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`,
  },
  {
    name: 'telegram',
    label: 'Share on Telegram',
    bg: '#229ed9',
    icon: <SiTelegram size={20} color="#ffffff" />,
    getUrl: (url, title) => `https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(title)}`,
  },
  {
    name: 'whatsapp',
    label: 'Share on WhatsApp',
    bg: '#25d366',
    icon: <SiWhatsapp size={20} color="#ffffff" />,
    getUrl: (url, title) => `https://api.whatsapp.com/send?text=${encodeURIComponent(`${title} ${url}`)}`,
  },
]

export const ShareModal = ({ showModal, closeModal, shareData }: ShareModalProps) => {
  if (!shareData) {
    return null
  }

  const { title, link, source } = shareData

  const onCopyClicked = () => {
    navigator.clipboard.writeText(shareData.link)
    toast('Link copied to clipboard', { theme: 'defaultToast' })
  }

  const handleShare = (platform: SharePlatform) => {
    const shareUrl = platform.getUrl(link, title)
    if (platform.name === 'email') {
      window.location.href = shareUrl
    } else {
      window.open(shareUrl, '_blank', 'noopener,noreferrer,width=600,height=500')
    }
  }

  return (
    <BaseModal
      isOpen={showModal}
      ariaHideApp={true}
      shouldCloseOnEsc={true}
      shouldCloseOnOverlayClick={true}
      shouldFocusAfterRender={false}
      onRequestClose={() => closeModal()}
      className="Modal scrollable shareModal"
      style={{
        overlay: {
          zIndex: 3,
        },
      }}
      overlayClassName="Overlay">
      <div className="modalHeader">
        <h1 className="modalTitle">Share</h1>
        <button
          className="modalCloseBtn"
          onClick={() => closeModal()}
          aria-label="Close share modal">
          <VscClose size="24" />
        </button>
      </div>

      <div className="shareBody">
        <p className="source">{source}</p>
        <h3 className="title">{title}</h3>
        <a className="link" href={link} target="_blank" rel="noreferrer">
          {link}
        </a>
      </div>

      <div className="shareOptions">
        <h3>Share via</h3>
        <div className="shareButtons">
          {sharingPlatforms.map((platform) => (
            <button
              key={platform.name}
              type="button"
              onClick={() => handleShare(platform)}
              aria-label={platform.label}
              style={{
                width: 38,
                height: 38,
                borderRadius: '50%',
                backgroundColor: platform.bg,
                border: 'none',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: 0,
                transition: 'opacity 0.2s linear',
              }}>
              {platform.icon}
            </button>
          ))}
        </div>
      </div>

      <div className="shareOptions">
        <h3>Or copy link</h3>
        <div className="settingRow">
          <div className="settingContent">
            <div className="form">
              <input type="text" value={link} disabled />

              <Button
                aria-label="Copy url to clipboard"
                startIcon={<VscCopy />}
                onClick={onCopyClicked}
                size="small">
                Copy
              </Button>
            </div>
          </div>
        </div>
      </div>
    </BaseModal>
  )
}
