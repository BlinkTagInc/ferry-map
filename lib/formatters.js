import { DateTime } from 'luxon'

export const formatTimeAgo = (timestamp) => {
  return DateTime.fromFormat(timestamp, 'yyyy-MM-dd HH:mm:ss\' GMT\'', { zone: "Etc/GMT" }).toRelative()
}

export const formatHeading = (heading) => {
  if (!heading || heading === 511) {
    return ''
  }

  return `${heading}°`
}