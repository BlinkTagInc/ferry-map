import { DateTime } from 'luxon'
import { lowerCase, startCase } from 'lodash'

export const formatVesselName = (name) => {
  return startCase(lowerCase(name))
}

export const formatTimeAgo = (timestamp) => {
  if (!timestamp) {
    return ''
  }

  return DateTime.fromFormat(timestamp, "yyyy-MM-dd HH:mm:ss' GMT'", {
    zone: 'Etc/GMT',
  }).toRelative()
}

export const formatHeading = (heading) => {
  if (!heading || heading === 511) {
    return 'Not available'
  }

  return `${heading}°`
}
