import Head from 'next/head'
import { useEffect, useState } from 'react'
import styles from '../styles/Home.module.css'

import Map from '../components/map.js'

export default function Home() {
  const [locations, setLocations] = useState()

  useEffect(() => {
    updateLocations()
    const refreshSeconds = 60
    setInterval(() => updateLocations(), 1000 * refreshSeconds)
  }, [])

  const updateLocations = async () => {
    const res = await fetch('/api/locations')
    const data = await res.json()
    setLocations(data)
  }

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
