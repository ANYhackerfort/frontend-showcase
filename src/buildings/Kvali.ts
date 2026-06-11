import { createSplatBuilding } from './SplatBuilding'

const KVALI_SPLAT = '/splats/Kvali.ply'

export function createKvali() {
  return createSplatBuilding({
    name: 'Kvali',
    url: KVALI_SPLAT,
    position: [26.1, 0.16, -11.3],
    rotationDegrees: [-92, 1.8, -114],
    scale: 2.85,
    assetQuaternion: [0, 0, 0, 1],
    options: {
      lod: 'quality',
    },
  })
}
