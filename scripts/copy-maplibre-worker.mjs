import { copyFileSync, mkdirSync } from 'node:fs'
import { createRequire } from 'node:module'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const require = createRequire(import.meta.url)
const dist = join(dirname(require.resolve('maplibre-gl/package.json')), 'dist')
const destination = fileURLToPath(
  new URL('../public/maplibre/', import.meta.url),
)

mkdirSync(destination, { recursive: true })

// The v6 worker imports the shared module from the same directory.
for (const file of ['maplibre-gl-worker.mjs', 'maplibre-gl-shared.mjs']) {
  copyFileSync(join(dist, file), join(destination, file))
}
