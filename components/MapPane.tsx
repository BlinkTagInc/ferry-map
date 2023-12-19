'use client'

import { useEffect, useState } from 'react'
import useInterval from '@/hooks/useInterval.js'

import Map from '@/components/Map.tsx'
import VesselList from '@/components/VesselList.tsx'

export default function MapPane() {
  const [locations, setLocations] = useState<{} | null>(null)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const fetchLocations = async () => {
    try {
      const response = await fetch('https://api.sanfranciscobayferry.com/locations', { cache: 'no-store' })
  
      if (!response.ok) {
        console.error(response.status)
        throw new Error(`Error fetching https://api.sanfranciscobayferry.com/locations`)
      }
  
      const data = await response.json()
      setLocations(data)
      setErrorMessage(null)
    } catch (error) {
      console.error(error)
      setLocations(null)
      setErrorMessage('Unable to fetch AIS data.')
    }
  }

  useInterval(fetchLocations, 1000 * 10)
  useEffect(() => {
    fetchLocations()
  }, [])

  return (
    <main className="main">
      <Map locations={locations} />
      <VesselList locations={locations} errorMessage={errorMessage} />
    </main>
  )
}