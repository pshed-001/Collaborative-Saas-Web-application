export function cn(...inputs) {
  return inputs.filter(Boolean).join(' ')
}

export function timeAgo(date) {
  const seconds = Math.floor((new Date() - new Date(date)) / 1000)
  const intervals = [
    { label: 'year', seconds: 31536000 },
    { label: 'month', seconds: 2592000 },
    { label: 'week', seconds: 604800 },
    { label: 'day', seconds: 86400 },
    { label: 'hour', seconds: 3600 },
    { label: 'minute', seconds: 60 },
  ]
  for (const interval of intervals) {
    const count = Math.floor(seconds / interval.seconds)
    if (count >= 1) return `${count} ${interval.label}${count > 1 ? 's' : ''} ago`
  }
  return 'just now'
}

export function countdown(ms) {
  if (ms <= 0) return 'Expired'
  const days = Math.floor(ms / 86400000)
  const hours = Math.floor((ms % 86400000) / 3600000)
  if (days > 0) return `${days}d ${hours}h remaining`
  const minutes = Math.floor((ms % 3600000) / 60000)
  if (hours > 0) return `${hours}h ${minutes}m remaining`
  return `${minutes}m remaining`
}

export function getInitials(firstname, lastname) {
  return `${(firstname || '')[0] || ''}${(lastname || '')[0] || ''}`.toUpperCase()
}

export function truncate(str, len = 100) {
  if (!str || str.length <= len) return str || ''
  return str.slice(0, len) + '\u2026'
}

export function getPresenceColor(userId) {
  if (!userId) return 'var(--presence-1)'
  let hash = 0
  for (let i = 0; i < userId.length; i++) {
    hash = userId.charCodeAt(i) + ((hash << 5) - hash)
  }
  const index = (Math.abs(hash) % 5) + 1
  return `var(--presence-${index})`
}
