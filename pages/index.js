import Head from 'next/head'
import { useEffect, useState } from 'react'
import { useIntervalWhen } from 'rooks'
import styles from '../styles/Home.module.css'

import Map from '../components/map.js'

export default function Home() {
  const [locations, setLocations] = useState()
  const refreshSeconds = 10
  useIntervalWhen(
    async () => {
      const res = await fetch('/api/locations')
      const data = await res.json()
      setLocations(data)
    },
    1000 * refreshSeconds, 
    true,
    true
  )

  return (
    <div className={styles.container}>
      <Head>
        <title>San Francisco Bay Ferry Map</title>
        <meta name="description" content="Map of San Francisco Bay Ferry realtime locations." />
      </Head>

      <main className={styles.main}>
        <Map locations={locations} />
      </main>

      <footer className={styles.footer}>
       
      </footer>
    </div>
  )
}
