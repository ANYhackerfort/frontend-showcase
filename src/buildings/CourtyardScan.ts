import { createSplatBuilding } from './SplatBuilding'

const PLACEHOLDER_SPLAT = 'https://sparkjs.dev/assets/splats/butterfly.spz'

export function createCourtyardScan() {
  return createSplatBuilding({
    name: 'Courtyard Scan',
    url: PLACEHOLDER_SPLAT,
    position: [1.65, 1.35, 2.4],
    rotation: [0, -0.55, 0],
    scale: [1.4, 1.4, 1.4],
    assetQuaternion: [0, 0, 0, 1],
  })
}
