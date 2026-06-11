import { createSplatBuilding } from './SplatBuilding'

const BUTTERFLY_SPLAT = 'https://sparkjs.dev/assets/splats/butterfly.spz'

export function createButterflyHall() {
  return createSplatBuilding({
    name: 'Butterfly Hall',
    url: BUTTERFLY_SPLAT,
    position: [-0.75, 1.55, 4.6],
    rotation: [0, 0.28, 0],
    scale: 2.2,
    assetQuaternion: [0, 0, 0, 1],
  })
}
