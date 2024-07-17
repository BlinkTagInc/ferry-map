import type { Metadata } from 'next'

import MapPane from '@/components/MapPane'

export const metadata: Metadata = {
  title: 'San Francisco Bay Ferry Map',
  description:
    'Map of San Francisco Passenger Ferry realtime locations for all agencies and companies.',
}

export default async function Home() {
  return (
    <div>
      <MapPane />

      <footer className="footer"></footer>
    </div>
  )
}
