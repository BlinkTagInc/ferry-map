import Head from 'next/head'
import { useState } from 'react'
import { useIntervalWhen } from 'rooks'
import styles from '../styles/Home.module.css'

import Map from '../components/map.js'
import VesselList from '../components/vessel-list.js'

export default function Home() {
  const [locations, setLocations] = useState()
  const [errorMessage, setErrorMessage] = useState()
  const refreshSeconds = 10
  useIntervalWhen(
    async () => {
      try {
        const res = await fetch('https://api.sanfranciscobayferry.com/api/locations')
        const data = await res.json()
        setLocations(data)
        setErrorMessage()
      } catch (error) {
        console.error(error)
        setErrorMessage('Unable to fetch AIS data.')
      }

    },
    1000 * refreshSeconds, 
    true,
    true
  )

  return (
    <div>
      <Head>
        <title>San Francisco Bay Ferry Map</title>
        <meta name="description" content="Map of San Francisco Passenger Ferry realtime locations for all agencies and companies." />
      </Head>

      <main className={styles.main}>
        <Map locations={locations} />
        <VesselList locations={locations} errorMessage={errorMessage} />
      </main>

      <footer className={styles.footer}></footer>
    </div>
  )
}
