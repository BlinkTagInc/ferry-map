import { useState } from 'react'
import { DateTime } from 'luxon'
import { useIntervalWhen } from 'rooks'
import { groupBy, sortBy } from 'lodash'

import { formatTimeAgo, formatVesselName } from '../lib/formatters.js'

const VesselInfo = ({ vessel }) => {
  const timeAgo = vessel.TIME !== undefined ? `(${formatTimeAgo(vessel.TIME)})` : ''
  const vesselIconClass = vessel.TIME === undefined ? 'not-found' : vessel.AGENCY === 'WETA' ? 'found-weta' : 'found-other'
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

        .vessel-icon.found-weta {
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

export default function VesselList({ locations }) {
  const [timeAgo, setTimeAgo] = useState('')

  useIntervalWhen(
    () => {
      if (locations) {
        setTimeAgo(DateTime.fromISO(locations.retrieved).toRelative({ unit: "seconds" }))
      }
    },
    1000, 
    true,
    true
  )

  const agencies = sortBy(groupBy(locations?.vessels || [], 'AGENCY'), vessels => vessels?.[0]?.AGENCY)

  // Always put weta first, followed by Golden Gate
  const sortedAgencies = agencies.length > 0 ? [
    agencies.find(vessels => vessels[0].AGENCY === 'WETA'),
    agencies.find(vessels => vessels[0].AGENCY === 'Golden Gate Ferry'),
    ...agencies.filter(vessels => !['WETA', 'Golden Gate Ferry'].includes(vessels[0].AGENCY))
  ] : []

  return (
    <>
      <div className="vessel-list-box mapboxgl-ctrl-group">
        <h1 className="site-title">San Francisco Bay Ferry Map</h1>
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
          <div className="timeago">Data from {timeAgo}</div>
        </div>
      </div>
      <style jsx>{`
        .vessel-list-box {
          width: 300px;
          height: 100vh;
          overflow-y: scroll;
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
      `}</style>
    </>
  )
}