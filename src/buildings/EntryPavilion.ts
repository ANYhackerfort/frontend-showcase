import { createSplatBuilding } from './SplatBuilding'

const LOCAL_SPLAT = '/splats/entry-pavilion.spz'

export function createEntryPavilion() {
  return createSplatBuilding({
    name: 'Entry Pavilion',
    url: LOCAL_SPLAT,
    position: [0.3, 0.15, -1.8],
    rotation: [0, Math.PI, 0],
    scale: 0.8,
    options: {
      onProgress: (event) => {
        if (event.total > 0) {
          console.info(`Entry pavilion ${(event.loaded / event.total) * 100}%`)
        }
      },
    },
  })
}
