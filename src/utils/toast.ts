export type ToastOptions = {
  theme?: string
  duration?: number
}

let activeToastTimeout: ReturnType<typeof setTimeout> | null = null

export function toast(message: string, options?: ToastOptions) {
  if (typeof document === 'undefined') return

  const containerId = 'devtab-toast-container'
  let container = document.getElementById(containerId)
  if (!container) {
    container = document.createElement('div')
    container.id = containerId
    container.style.cssText = `
      position: fixed;
      bottom: 24px;
      left: 50%;
      transform: translateX(-50%);
      z-index: 99999;
      pointer-events: none;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 8px;
    `
    document.body.appendChild(container)
  }

  // Clear previous toast if any
  container.innerHTML = ''
  if (activeToastTimeout) {
    clearTimeout(activeToastTimeout)
  }

  const toastEl = document.createElement('div')
  toastEl.className = options?.theme || 'defaultToast'
  toastEl.textContent = message
  toastEl.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.3)'
  toastEl.style.transition = 'opacity 0.25s ease, transform 0.25s ease'
  toastEl.style.opacity = '0'
  toastEl.style.transform = 'translateY(12px)'

  container.appendChild(toastEl)

  // Trigger entrance transition
  requestAnimationFrame(() => {
    toastEl.style.opacity = '1'
    toastEl.style.transform = 'translateY(0)'
  })

  const duration = options?.duration ?? 3000

  activeToastTimeout = setTimeout(() => {
    toastEl.style.opacity = '0'
    toastEl.style.transform = 'translateY(12px)'
    setTimeout(() => {
      if (toastEl.parentNode === container) {
        container.removeChild(toastEl)
      }
    }, 250)
  }, duration)
}

export default toast
