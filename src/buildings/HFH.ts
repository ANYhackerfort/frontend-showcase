import { createSplatBuilding } from './SplatBuilding'

const HFH_SPLAT = '/splats/HFH.ply'

export function createHFH() {
  return createSplatBuilding({
    name: 'HFH',
    url: HFH_SPLAT,
    position: [22.8, 0.09, -7],
    rotationDegrees: [90, 174, -82],
    scale: 3.2,
    assetQuaternion: [0, 0, 0, 1],
  })
}
