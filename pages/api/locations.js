import cacheData from "memory-cache"

async function fetchWithCache() {
  const value = cacheData.get('locations')
  if (value) {
    return value
  } else {
    const res = await fetch(`https://data.aishub.net/ws.php?username=${process.env.AISHUB_USERNAME}&format=1&output=json&latmin=37.2&latmax=38.2&lonmin=-122.6&lonmax=-121.6`)
    const data = await res.json()

    if (!data || data.length < 2 || data[0].error === true) {
      console.error('Error fetching data from AIShub')
      return null
    }

    const wetaMMSIs = [
      368018070,
      366971280,
      368063440,
      367380880,
      367765240,
      366989360,
      368088610,
      366989380,
      366983830,
      367391830,
      367425520,
      366950020,
      367436230,
      368088590
    ]

    const vessels = data[1].filter(vessel => wetaMMSIs.includes(vessel.MMSI))
    const locations = {
      retrieved: new Date(),
      vessels
    }
    cacheData.put('locations', locations, 1000 * 60)
    return locations
  }
}

export default async function handler(req, res) {
  const data = await fetchWithCache()

  if (data === null) {
    return res.status(500).json({ error: 'Error fetching data' })
  }

  res.status(200).json(data)
}


