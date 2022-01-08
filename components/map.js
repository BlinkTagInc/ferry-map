import { useCallback, useState } from 'react'
import MapGL, { NavigationControl, Source, Layer } from 'react-map-gl'

import { formatHeading, formatTimeAgo } from '../lib/formatters.js'

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