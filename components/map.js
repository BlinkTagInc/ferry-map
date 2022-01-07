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
          'circle-color': '#fff200',
          'circle-opacity': 0.95,
          'circle-radius': {
            base: 4.75,
            stops: [[10, 7], [22, 180]]
          },
          'circle-stroke-width': 2,
          'circle-stroke-color': 'rgb(246, 247, 178)'
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
  const timeAgo = vessel.TIME !== undefined ? formatTimeAgo(vessel.TIME) : 'Not Found'
  return (
    <div>
      {startCase(lowerCase(vessel.NAME))} <small className={`${vessel.TIME === undefined ? 'not-found' : 'found'}`}>({timeAgo})</small>
      <style jsx>{`
        .not-found {
          background: rgba(236, 0, 0, 0.33);
        }
        .found {
          background: rgba(10, 236, 0, 0.33);
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

  return (
    <>
      <div className="vessel-list-box mapboxgl-ctrl-group">
        <h1 className="site-title">San Francisco Bay Ferry Map</h1>
        <div className="vessel-list">
          {agencies.map(agencyVessels => {
            return (
              <>
                <div className="agency-name">{agencyVessels[0].AGENCY}</div>
                {sortBy(agencyVessels, vessel => vessel.NAME).map(vessel => {
                  return <VesselInfo key={vessel.MMSI} vessel={vessel} />
                })}
              </>
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