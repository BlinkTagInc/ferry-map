import '@/app/global.css'
import 'maplibre-gl/dist/maplibre-gl.css'

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
