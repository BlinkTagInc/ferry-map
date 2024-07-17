'use client'

import { useState } from 'react'
import { DateTime } from 'luxon'

import useInterval from '@/hooks/useInterval'

const TimeAgo = ({ locations }) => {
  const [timeAgo, setTimeAgo] = useState('')

  useInterval(() => {
    if (locations) {
      setTimeAgo(
        DateTime.fromISO(locations.retrieved).toRelative({ unit: 'seconds' }),
      )
    }
  }, 1000)

  if (!locations?.vessels) {
    return null
  }

  return <div className="timeago">Data from {timeAgo}</div>
}

export default TimeAgo
