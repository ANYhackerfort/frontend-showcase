import {
  LinearFilter,
  LinearMipmapLinearFilter,
  Mesh,
  MeshBasicMaterial,
  PlaneGeometry,
  SRGBColorSpace,
  TextureLoader,
} from 'three'

const GROUND_TEXTURE = '/ground/ucsb.png'
const GROUND_IMAGE_WIDTH = 80
const GROUND_IMAGE_ASPECT = 1107 / 1479
const GROUND_IMAGE_DEPTH = GROUND_IMAGE_WIDTH / GROUND_IMAGE_ASPECT

export function createGroundPlane(maxAnisotropy = 16) {
  const texture = new TextureLoader().load(GROUND_TEXTURE)
  texture.colorSpace = SRGBColorSpace
  texture.anisotropy = maxAnisotropy
  texture.generateMipmaps = true
  texture.minFilter = LinearMipmapLinearFilter
  texture.magFilter = LinearFilter

  const geometry = new PlaneGeometry(
    GROUND_IMAGE_WIDTH,
    GROUND_IMAGE_DEPTH,
    64,
    64,
  )
  const material = new MeshBasicMaterial({
    map: texture,
    color: '#252a3a',
  })
  const plane = new Mesh(geometry, material)

  plane.name = 'Walkable image plane'
  plane.receiveShadow = true
  plane.rotation.x = -Math.PI / 2

  return {
    plane,
    dispose: () => {
      geometry.dispose()
      material.dispose()
      texture.dispose()
    },
  }
}
