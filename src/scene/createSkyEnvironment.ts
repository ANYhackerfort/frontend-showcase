import { EXRLoader } from 'three/examples/jsm/loaders/EXRLoader.js'
import { EquirectangularReflectionMapping, Scene, type Texture } from 'three'

const SKY_TEXTURE = '/ground/qwantani_night_puresky_2k.exr'
const SKY_BACKGROUND_INTENSITY = 0.45
const SKY_ENVIRONMENT_INTENSITY = 0.75

export function createSkyEnvironment(scene: Scene) {
  let skyTexture: Texture | null = null

  scene.backgroundIntensity = SKY_BACKGROUND_INTENSITY
  scene.environmentIntensity = SKY_ENVIRONMENT_INTENSITY

  new EXRLoader().load(SKY_TEXTURE, (texture) => {
    skyTexture = texture
    texture.mapping = EquirectangularReflectionMapping
    scene.background = texture
    scene.environment = texture
  })

  return {
    dispose: () => {
      skyTexture?.dispose()
    },
  }
}
