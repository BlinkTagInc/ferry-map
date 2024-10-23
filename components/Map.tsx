'use client'
import { useEffect, useState } from 'react'
import {
  GeolocateControl,
  FullscreenControl,
  NavigationControl,
  Marker,
  Popup,
} from 'react-map-gl'
import Map from 'react-map-gl/maplibre'
import useWindowDimensions from '@/hooks/useWindowDimensions.js'

import {
  formatHeading,
  formatTimeAgo,
  formatVesselName,
} from '@/lib/formatters.js'

const Markers = ({ locations, onClick }) => {
  const vessels =
    locations?.vessels?.filter((vessel) => vessel.TIME !== undefined) || []
  return vessels.map((vessel) => {
    const vesselIcon =
      vessel.AGENCY === 'San Francisco Bay Ferry'
        ? 'sfbf-icon.svg'
        : 'boat-icon.svg'
    const heading =
      vessel.HEADING && vessel.HEADING !== 511
        ? parseInt(vessel.HEADING, 10)
        : 0
    return (
      <Marker
        key={vessel.MMSI}
        latitude={Number(vessel.LATITUDE)}
        longitude={Number(vessel.LONGITUDE)}
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
      <tbody>
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
      </tbody>
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

export default function FerryMap({ locations }) {
  const [popupInfo, setPopupInfo] = useState(null)
  const [isHydrated, setIsHydrated] = useState(false)

  const { width } = useWindowDimensions()

  useEffect(() => {
    setIsHydrated(true)
  }, [])

  if (!isHydrated) {
    return <div style={{ width: '100%' }} />
  }

  const mapWidth = width > 640 ? 'calc(100vw - 300px)' : '100%'
  const mapHeight = width > 640 ? '100vh' : '400px'

  return (
    <Map
      initialViewState={{
        latitude: 37.8,
        longitude: -122.4,
        zoom: 10,
        bearing: 0,
        pitch: 0,
      }}
      style={{ width: mapWidth, height: mapHeight }}
      mapStyle="https://weta.boats/mapstyle.json"
      maplibreLogo
    >
      <Markers locations={locations} onClick={setPopupInfo} />
      {popupInfo && (
        <Popup
          anchor="top"
          longitude={Number(popupInfo.LONGITUDE)}
          latitude={Number(popupInfo.LATITUDE)}
          closeOnClick={false}
          onClose={() => setPopupInfo(null)}
        >
          <PopupContent vessel={popupInfo} />
        </Popup>
      )}
      <GeolocateControl position="top-left" />
      <FullscreenControl position="top-left" />
      <NavigationControl position="top-left" />
    </Map>
  )
}
