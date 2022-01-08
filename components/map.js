import MapGL, { NavigationControl, Source, Layer } from 'react-map-gl'
import { useCallback, useState } from 'react'
import { DateTime } from 'luxon'
import { useIntervalWhen } from 'rooks'

import { formatHeading, formatTimeAgo } from '../lib/formatters'
import { groupBy, lowerCase, sortBy, startCase } from 'lodash'

const MapData = ({ locations }) => {
  const vessels = locations?.vessels.filter(vessel => vessel.TIME !== undefined) || []
  const geojson = {
    "type": "FeatureCollection",
    "features": vessels.map(vessel => {
      return {
        "type": "Feature",
        "properties": vessel,
        "geometry": {
          "type": "Point",
          "coordinates": [
            vessel.LONGITUDE,
            vessel.LATITUDE
          ]
        }
      }
    })
  }

  return (
    <Source
      type="geojson"
      data={geojson}
    >
      <Layer
        id="locations"
        type="circle"
        paint={{
          'circle-color': [
            'match',
            ['get', 'AGENCY'],
            'WETA',
            '#ff8c00',
            /* other */ '#fff200'
          ],
          'circle-opacity': 0.95,
          'circle-radius': {
            base: 4.75,
            stops: [[10, 7], [22, 100]]
          },
          'circle-stroke-width': 2,
          'circle-stroke-color': [
            'match',
            ['get', 'AGENCY'],
            'WETA',
            '#ffd7a6',
            /* other */ '#f6f7b2'
          ]
        }}
      />
    </Source>
  )
}

const HoverInfo = ({ hoverInfo }) => {
  if (!hoverInfo) {
    return null
  }

  return (
    <div className="tooltip" style={{left: hoverInfo.x, top: hoverInfo.y}}>
      <div>Vessel: {hoverInfo.NAME}</div>
      <div>Agency: {hoverInfo.AGENCY}</div>
      <div>MMSI: {hoverInfo.MMSI}</div>
      <div>Last Seen: {formatTimeAgo(hoverInfo.TIME)}</div>
      <div>Speed: {hoverInfo.SOG} knots</div>
      <div>Heading: {formatHeading(hoverInfo.HEADING)}</div>
      <div>Status: {hoverInfo.STATUS}</div>
      <div>Destination: {hoverInfo.DEST}</div>
      <div>ETA: {hoverInfo.ETA}</div>
    </div>
  )
}

const VesselInfo = ({ vessel }) => {
  const timeAgo = vessel.TIME !== undefined ? `(${formatTimeAgo(vessel.TIME)})` : ''
  const vesselIconClass = vessel.TIME === undefined ? 'not-found' : vessel.AGENCY === 'WETA' ? 'found-weta' : 'found-other'
  return (
    <div className="vessel-info">
      <div
        className={`vessel-icon ${vesselIconClass}`}
        title={vessel.TIME === undefined ? 'Not found' : ''}
      ></div>
      {startCase(lowerCase(vessel.NAME))}
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

const InfoBox = ({ locations }) => {
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

  // Always put weta first
  const sortedAgencies = agencies.length > 0 ? [
    agencies.find(vessels => vessels[0].AGENCY === 'WETA'),
    ...agencies.filter(vessels => vessels[0].AGENCY !== 'WETA')
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

export default function Map({ locations }) {
  const [viewport, setViewport] = useState({
    latitude: 37.9,
    longitude: -122.4,
    zoom: 10,
    bearing: 0,
    pitch: 0
  })
  const [hoverInfo, setHoverInfo] = useState(null)

  const onHover = useCallback(event => {
    const {
      features,
      srcEvent: {offsetX, offsetY}
    } = event
    const hoveredFeature = features && features[0]

    setHoverInfo(
      hoveredFeature
        ? {
            ...hoveredFeature.properties,
            x: offsetX,
            y: offsetY
          }
        : null
    )
  }, [])

  return (
    <div className="map-container">
      <MapGL
        {...viewport}
        width="calc(100vw - 300px)"
        height="100vh"
        className="map"
        mapStyle="mapbox://styles/mapbox/dark-v9"
        onViewportChange={setViewport}
        mapboxApiAccessToken={process.env.NEXT_PUBLIC_MAPBOX_TOKEN}
        interactiveLayerIds={locations?.vessels?.length > 0 ? ['locations'] : []}
        onHover={onHover}
      >
        <MapData locations={locations} />
        <HoverInfo hoverInfo={hoverInfo} />
        <div className="map-nav">
          <NavigationControl onViewportChange={viewport => setViewport(viewport)} />
        </div>
      </MapGL>
      <InfoBox locations={locations} />
      <style jsx>{`
        .map-container {
          display: flex;
        }
        .map-nav {
          position: absolute;
          top: 0;
          left: 0;
          padding: 10px;
        }
      `}</style>
    </div>
  )
}