import MapGL, { NavigationControl, Source, Layer } from 'react-map-gl'
import { useCallback, useState } from 'react'
import { DateTime } from 'luxon'

const formatNavStat = (statusCode) => {
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

const formatTimeAgo = (timestamp) => {
  return DateTime.fromFormat(timestamp, 'yyyy-MM-dd HH:mm:ss\' GMT\'', { zone: "Etc/GMT" }).toRelative()
}

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
      <div>Vessel: {hoverInfo.feature.properties.NAME}</div>
      <div>MMSI: {hoverInfo.feature.properties.MMSI}</div>
      <div>Last Seen: {formatTimeAgo(hoverInfo.feature.properties.TIME)}</div>
      <div>Speed: {hoverInfo.feature.properties.SOG / 10} knots</div>
      <div>Status: {formatNavStat(hoverInfo.feature.properties.NAVSTAT)}</div>
      <div>Destination: {hoverInfo.feature.properties.DEST} (ETA: {hoverInfo.feature.properties.ETA})</div>
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
    } = event;
    const hoveredFeature = features && features[0];

    setHoverInfo(
      hoveredFeature
        ? {
            feature: hoveredFeature,
            x: offsetX,
            y: offsetY
          }
        : null
    );
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
        <div className="vessel-list mapboxgl-ctrl-group">
          <h3 className="vessel-list-title">Vessels</h3>
          {locations?.vessels?.map(vessel => {
            return <div key={vessel.MMSI}>{vessel.NAME} <small>({formatTimeAgo(vessel.TIME)})</small></div> 
          })}
        </div>
      </MapGL>
      <style jsx>{`
        .map-nav {
          position: absolute;
          top: 0;
          left: 0;
          padding: 10px;
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
          margin: 0;
        }
      `}</style>
    </>
  )
}