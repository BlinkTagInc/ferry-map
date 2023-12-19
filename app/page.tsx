import type { Metadata } from 'next'

import Map from '@/components/Map.tsx'
import VesselList from '@/components/VesselList.tsx'

export const metadata: Metadata = {
  title: 'San Francisco Bay Ferry Map',
  description: 'Map of San Francisco Passenger Ferry realtime locations for all agencies and companies.',
}

export default async function Home() {
  let locations = []
  let errorMessage

  try {
    const response = await fetch('https://api.sanfranciscobayferry.com/locations', { cache: 'no-store' })

    if (!response.ok) {
      console.error(response.status)
      throw new Error(`Error fetching https://api.sanfranciscobayferry.com/locations`)
    }

    locations = await response.json()
  } catch (error) {
    console.error(error)
    errorMessage = 'Unable to fetch AIS data.'
  }

  return (
    <div>
      <main className="main">
        <Map locations={locations} />
        <VesselList locations={locations} errorMessage={errorMessage} />
      </main>

      <footer className="footer"></footer>
    </div>
  )
}