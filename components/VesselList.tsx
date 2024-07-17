'use client'

import { useState } from 'react'
import { groupBy, sortBy } from 'lodash'

import { formatTimeAgo, formatVesselName } from '@/lib/formatters.js'
import TimeAgo from '@/components/TimeAgo.tsx'
import useInterval from '@/hooks/useInterval.js'

const VesselInfo = ({ vessel }) => {
  const [timeAgo, setTimeAgo] = useState('')

  useInterval(() => {
    if (vessel) {
      setTimeAgo(vessel.TIME !== undefined ? `(${formatTimeAgo(vessel.TIME)})` : '')
    }
  }, 1000);

  const vesselIconClass = vessel.TIME === undefined ? 'not-found' : vessel.AGENCY === 'San Francisco Bay Ferry' ? 'found-sfbf' : 'found-other'
  return (
    <div className="vessel-info">
      <div
        className={`vessel-icon ${vesselIconClass}`}
        title={vessel.TIME === undefined ? 'Not found' : ''}
      ></div>
      {formatVesselName(vessel.NAME)}
      <small className="status-text">{timeAgo}</small>
      <style jsx>{`
        .vessel-info {
          display: flex;
          align-items: center;
        }

        .vessel-icon {
          width: 15px;
          height: 15px;
          border-radius: 50%;
          border-width: 2px;
          border-style: solid;
          margin-right: 3px;
        }

        .vessel-icon.found-sfbf {
          background: #ff8c00;
          border-color: #ffd7a6;
        }

        .vessel-icon.found-other {
          background: #fff200;
          border-color: #f6f7b2;
        }

        .vessel-icon.not-found {
          background: #787878;
          border-color: #b5b3b3;
        }

        .status-text {
          margin-left: 10px;
        }
      `}</style>
    </div> 
  )
}

export default function VesselList({ locations, errorMessage }) {
  const agencies = sortBy(groupBy(locations?.vessels || [], 'AGENCY'), vessels => vessels?.[0]?.AGENCY)

  // Always put San Francisco Bay Ferry first, followed by Golden Gate
  const sortedAgencies = agencies.length > 0 ? [
    agencies.find(vessels => vessels[0].AGENCY === 'San Francisco Bay Ferry'),
    agencies.find(vessels => vessels[0].AGENCY === 'Golden Gate Ferry'),
    ...agencies.filter(vessels => !['San Francisco Bay Ferry', 'Golden Gate Ferry'].includes(vessels[0].AGENCY))
  ] : []

  return (
    <>
      <div className="vessel-list-box mapboxgl-ctrl-group">
        <h1 className="site-title">San Francisco Bay Ferry Map</h1>
        {errorMessage && <div className="error-message">Error: {errorMessage}</div>}
        <div className="vessel-list">
          {sortedAgencies.map((agencyVessels, index) => {
            return (
              <div key={index}>
                <div className="agency-name">{agencyVessels[0].AGENCY}</div>
                {sortBy(agencyVessels, vessel => vessel.NAME).map(vessel => {
                  return <VesselInfo key={vessel.MMSI} vessel={vessel} />
                })}
              </div>
            )
          })}
          <TimeAgo locations={locations} />
        </div>
      </div>
      <style jsx>{`
        .vessel-list-box {
        }

        .site-title {
          margin: 0;
          font-size: 1.3rem;
          padding: 4px 8px;
          background: #e5e5e5;
        }

        .vessel-list {
          padding: 0 10px 10px;
        }
        
        .agency-name {
          font-weight: 600;
          border-bottom: 1px solid #ccc;
          margin: 8px 0 4px;
          font-size: 1.1rem;
        }

        .timeago {
          font-size: 10px;
          padding-top: 10px;
        }
        
        .error-message {
          margin: .5rem;
          padding: .75rem 1.25rem;
          margin-bottom: 1rem;
          border: 1px solid transparent;
          border-radius: .25rem;
          color: #721c24;
          background-color: #f8d7da;
          border-color: #f5c6cb;
        }

        @media (min-width: 640px) {
          .vessel-list-box {
            width: 300px;
            height: 100vh;
            overflow-y: scroll;
          }
        }
      `}</style>
    </>
  )
}