import { SplatMesh } from '@sparkjsdev/spark'
import { Group, MathUtils } from 'three'
import type { SplatBuildingConfig, Vec3 } from './types'

function applyScale(group: Group, scale: number | Vec3) {
  if (typeof scale === 'number') {
    group.scale.setScalar(scale)
    return
  }

  group.scale.set(...scale)
}

export function createSplatBuilding({
  name,
  url,
  position = [0, 0, 0],
  rotation = [0, 0, 0],
  rotationDegrees,
  scale = 1,
  assetQuaternion = [1, 0, 0, 0],
  options,
}: SplatBuildingConfig) {
  const group = new Group()
  const splat = new SplatMesh({
    url,
    lod: false,
    raycastable: true,
    minRaycastOpacity: 0.08,
    ...options,
  })

  group.name = name
  splat.name = `${name} splat`
  splat.quaternion.set(...assetQuaternion)
  group.position.set(...position)
  if (rotationDegrees) {
    group.rotation.set(
      MathUtils.degToRad(rotationDegrees[0]),
      MathUtils.degToRad(rotationDegrees[1]),
      MathUtils.degToRad(rotationDegrees[2]),
    )
  } else {
    group.rotation.set(...rotation)
  }
  applyScale(group, scale)
  group.add(splat)

  return group
}
