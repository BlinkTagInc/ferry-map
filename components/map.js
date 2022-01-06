import MapGL, { NavigationControl, Source, Layer } from 'react-map-gl'
import { useCallback, useState } from 'react'
import { DateTime } from 'luxon'
import { useIntervalWhen } from 'rooks'

import { formatHeading, formatTimeAgo } from '../lib/formatters'
import { groupBy, map, sortBy } from 'lodash'

const MapData = ({ locations }) => {
  const vessels = locations?.vessels || []
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

const InfoBox = ({ locations }) => {
  const [timeAgo, setTimeAgo] = useState('')

  useIntervalWhen(
    () => {
      setTimeAgo(DateTime.fromISO(locations.retrieved).toRelative({ unit: "seconds" }))
    },
    1000, 
    true,
    true
  )

  const agencies = sortBy(groupBy(locations?.vessels || [], 'AGENCY'), ([value, key]) => value)

  return (
    <>
      <div className="vessel-list mapboxgl-ctrl-group">
        <h3 className="vessel-list-title">Vessels (last seen)</h3>
        {agencies.map(agencyVessels => {
          return (
            <>
              <div className="agency-name">{agencyVessels[0].AGENCY}</div>
              {agencyVessels.map(vessel => {
                return <div key={vessel.MMSI}>{vessel.NAME} <small>({formatTimeAgo(vessel.TIME)})</small></div> 
              })}
            </>
          )
        })}
        <div className="timeago">Data from {timeAgo}</div>
      </div>
      <style jsx>{`
        .agency-name {
          font-weight: 600;
          border-bottom: 1px solid #ccc;
          margin-bottom: 4px;
          font-size: 1.1rem;
        }

        .vessel-list {
          position: absolute;
          top: 0;
          right: 0;
          margin: 10px;
          padding: 10px;
          border-radius: 
        }

        .vessel-list-title {
          margin: 0 0 5px;
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
    <>
      <MapGL
        {...viewport}
        width="100vw"
        height="100vh"
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
        {locations && <InfoBox locations={locations} />}
      </MapGL>
      <style jsx>{`
        .map-nav {
          position: absolute;
          top: 0;
          left: 0;
          padding: 10px;
        }
      `}</style>
    </>
  )
}