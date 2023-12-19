'use client'
import { useEffect, useState } from 'react'
import MapGL, { NavigationControl, Marker, Popup } from 'react-map-gl'
import useWindowDimensions from '@/hooks/useWindowDimensions.js'

import { formatHeading, formatTimeAgo, formatVesselName } from '@/lib/formatters.js'

const Markers = ({ locations, onClick }) => {
  const vessels = locations?.vessels?.filter(vessel => vessel.TIME !== undefined) || []
  return vessels.map(vessel => {
    const vesselIcon = vessel.AGENCY === 'WETA' ? 'weta-icon.svg' : 'boat-icon.svg'
    const heading = vessel.HEADING && vessel.HEADING !== 511 ? parseInt(vessel.HEADING, 10) : 0
    return (
      <Marker
        key={vessel.MMSI}
        latitude={vessel.LATITUDE}
        longitude={vessel.LONGITUDE}
        offsetLeft={-5}
        offsetTop={-11}
        onClick={() => onClick(vessel)}
      >
        <img src={vesselIcon} alt="" className="marker" />
        <style jsx>{`
          .marker {
            width: 10px;
            height: 23px;
            cursor: pointer;
            transform: rotate(${heading}deg);
          }
        `}</style>
      </Marker>
    )
  })
}

const PopupContent = ({ vessel }) => {
  if (!vessel) {
    return null
  }

  return (
    <table className="info-table">
      <tr>
        <td>Vessel</td>
        <td>{formatVesselName(vessel.NAME)}</td>
      </tr>
      <tr>
        <td>Agency</td>
        <td>{vessel.AGENCY}</td>
      </tr>
      <tr>
        <td>MMSI</td>
        <td>{vessel.MMSI}</td>
      </tr>
      <tr>
        <td>Last Seen</td>
        <td>{formatTimeAgo(vessel.TIME)}</td>
      </tr>
      <tr>
        <td>Speed</td>
        <td>{vessel.SOG} knots</td>
      </tr>
      <tr>
        <td>Heading</td>
        <td>{formatHeading(vessel.HEADING)}</td>
      </tr>
      <tr>
        <td>Status</td>
        <td>{vessel.STATUS}</td>
      </tr>
      <tr>
        <td>Destination</td>
        <td>{vessel.DEST}</td>
      </tr>
      <tr>
        <td>ETA</td>
        <td>{vessel.ETA}</td>
      </tr>
      <style jsx>{`
        .info-table td {
          border-bottom: 1px solid #ccc;
        }
        .info-table tr:last-child td {
          border-bottom: none;
        }
        .info-table td:last-child {
          font-weight: bold;
          padding-left: 4px;
        }
      `}</style>
    </table>
  )
}

export default function Map({ locations }) {
  const [viewport, setViewport] = useState({
    latitude: 37.8,
    longitude: -122.4,
    zoom: 10,
    bearing: 0,
    pitch: 0,
  })
  const [popupInfo, setPopupInfo] = useState(null)
  const [isHydrated, setIsHydrated] = useState(false)

  const { width } = useWindowDimensions();

  useEffect(() => {
    setIsHydrated(true)
  }, [])

  if (!isHydrated) {
    return <div style={{ width: '100%' }} />
  }

  const mapWidth = width > 640 ? 'calc(100vw - 300px)' : '100%'
  const mapHeight = width > 640 ? '100vh' : '400px'

  return (
    <MapGL
      {...viewport}
      width={mapWidth}
      height={mapHeight}
      className="map"
      mapStyle="mapbox://styles/mapbox/dark-v11"
      onViewportChange={setViewport}
      mapboxApiAccessToken={process.env.NEXT_PUBLIC_MAPBOX_TOKEN}
    >
      <Markers locations={locations} onClick={setPopupInfo} />
      {popupInfo && (
          <Popup
            tipSize={10}
            anchor="top"
            longitude={popupInfo.LONGITUDE}
            latitude={popupInfo.LATITUDE}
            closeOnClick={false}
            onClose={setPopupInfo}
          >
            <PopupContent vessel={popupInfo} />
          </Popup>
        )}
      <div className="map-nav">
        <NavigationControl onViewportChange={viewport => setViewport(viewport)} />
      </div>
      <style jsx>{`
        .map-nav {
          position: absolute;
          top: 0;
          left: 0;
          padding: 10px;
        }
      `}</style>
    </MapGL>
  )
}