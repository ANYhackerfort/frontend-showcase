import { createSplatBuilding } from './SplatBuilding'

const MRL_SPLAT = '/splats/MRL.ply'

export function createMRL() {
  return createSplatBuilding({
    name: 'MRL',
    url: MRL_SPLAT,
    position: [20.3, 0.045, -9.1],
    rotationDegrees: [88, 179, 101],
    scale: 3.1,
    assetQuaternion: [0, 0, 0, 1],
  })
}
