import { createSplatBuilding } from './SplatBuilding'

const CHEM_SPLAT = '/splats/CHEM.ply'

export function createCHEM() {
  return createSplatBuilding({
    name: 'CHEM',
    url: CHEM_SPLAT,
    position: [14.5, 0.08, -14.9],
    rotationDegrees: [0, 94, -82],
    scale: 4.45,
    assetQuaternion: [0, 0, 0, 1],
  })
}
