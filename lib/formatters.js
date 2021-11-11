import { DateTime } from 'luxon'

export const formatNavStat = (statusCode) => {
  const navStatuses = [
    {
      statusCode: 0,
      statusText: 'Under way using engine'
    },
    {
      statusCode: 1,
      statusText: 'At anchor'
    },
    {
      statusCode: 2,
      statusText: 'Not under command'
    },
    {
      statusCode: 3,
      statusText: 'Restricted manoeuverability'
    },
    {
      statusCode: 4,
      statusText: 'Constrained by her draught'
    },
    {
      statusCode: 5,
      statusText: 'Moored'
    },
    {
      statusCode: 6,
      statusText: 'Aground'
    },
    {
      statusCode: 7,
      statusText: 'Engaged in Fishing'
    },
    {
      statusCode: 8,
      statusText: 'Under way sailing'
    },
    {
      statusCode: 9,
      statusText: 'Reserved for future amendment of Navigational Status for HSC'
    },
    {
      statusCode: 10,
      statusText: 'Reserved for future amendment of Navigational Status for WIG'
    },
    {
      statusCode: 11,
      statusText: 'Reserved for future use'
    },
    {
      statusCode: 12,
      statusText: 'Reserved for future use'
    },
    {
      statusCode: 13,
      statusText: 'Reserved for future use'
    },
    {
      statusCode: 14,
      statusText: 'AIS-SART is active'
    },
    {
      statusCode: 15,
      statusText: 'Not defined (default)'
    }
  ]

  const status = navStatuses.find(status => status.statusCode === statusCode)

  return status?.statusText || 'Unknown'
}

export const formatTimeAgo = (timestamp) => {
  return DateTime.fromFormat(timestamp, 'yyyy-MM-dd HH:mm:ss\' GMT\'', { zone: "Etc/GMT" }).toRelative()
}