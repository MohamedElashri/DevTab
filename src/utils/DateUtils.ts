export const diffBetweenTwoDatesInMinutes = (oldestDate: number, newestDate: number) => {
  return Math.floor((oldestDate - newestDate) / (1000 * 60))
}

const SECOND = 1000
const MINUTE = 60 * SECOND
const HOUR = 60 * MINUTE
const DAY = 24 * HOUR
const MONTH = 30 * DAY
const YEAR = 365 * DAY

export const formatTimeAgo = (inputDate: Date | number | string): string => {
  const date = typeof inputDate === 'object' ? inputDate.getTime() : new Date(inputDate).getTime()
  if (isNaN(date)) return ''
  const diff = Date.now() - date
  if (diff < MINUTE) {
    return 'just now'
  }
  if (diff < HOUR) {
    const mins = Math.floor(diff / MINUTE)
    return mins <= 1 ? '1 minute ago' : `${mins} minutes ago`
  }
  if (diff < DAY) {
    const hours = Math.floor(diff / HOUR)
    return hours <= 1 ? '1 hour ago' : `${hours} hours ago`
  }
  if (diff < MONTH) {
    const days = Math.floor(diff / DAY)
    return days <= 1 ? 'yesterday' : `${days} days ago`
  }
  if (diff < YEAR) {
    const months = Math.floor(diff / MONTH)
    return months <= 1 ? '1 month ago' : `${months} months ago`
  }
  const years = Math.floor(diff / YEAR)
  return years <= 1 ? '1 year ago' : `${years} years ago`
}