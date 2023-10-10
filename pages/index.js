import Head from 'next/head'
import dynamic from 'next/dynamic'
import { useRouter } from 'next/router'

import styles from '../styles/Home.module.css'
const Map = dynamic(
  () => import('../components/Map.js'),
  { ssr: false }
)
const VesselList = dynamic(
  () => import('../components/VesselList.js'),
  { ssr: false }
)
import useInterval from '../hooks/useInterval.js'

export default function Home({ locations, errorMessage }) {
  const router = useRouter()

  // Refresh page every 10 seconds
  useInterval(() => router.replace(router.asPath), 10 * 1000)

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


export async function getServerSideProps() {
  let locations = []
  let errorMessage = null

  try {
    const response = await fetch('https://api.sanfranciscobayferry.com/locations')

    if (!response.ok) {
      console.error(response.status)
      throw new Error(`Error fetching https://api.sanfranciscobayferry.com/locations`)
    }

    locations = await response.json()
  } catch (error) {
    console.error(error)
    errorMessage = 'Unable to fetch AIS data.'
  }

  return {
    props: {
      locations,
      errorMessage
    },
  }
}
