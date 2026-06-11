import { MathUtils, type Group } from 'three'
import type { Vec3 } from '../buildings/types'

export type BuildingTransform = {
  position: Vec3
  rotationDegrees: Vec3
  scale: number
}

export type BuildingTransformHandle = {
  name: string
  transform: BuildingTransform
  applyTransform: (transform: BuildingTransform) => void
}

export function createBuildingTransformHandle(
  building: Group,
): BuildingTransformHandle {
  return {
    name: building.name,
    transform: readBuildingTransform(building),
    applyTransform: (transform) => applyBuildingTransform(building, transform),
  }
}

function readBuildingTransform(building: Group): BuildingTransform {
  return {
    position: [
      round(building.position.x),
      round(building.position.y),
      round(building.position.z),
    ],
    rotationDegrees: [
      round(MathUtils.radToDeg(building.rotation.x)),
      round(MathUtils.radToDeg(building.rotation.y)),
      round(MathUtils.radToDeg(building.rotation.z)),
    ],
    scale: round(building.scale.x),
  }
}

function applyBuildingTransform(
  building: Group,
  { position, rotationDegrees, scale }: BuildingTransform,
) {
  building.position.set(...position)
  building.rotation.set(
    MathUtils.degToRad(rotationDegrees[0]),
    MathUtils.degToRad(rotationDegrees[1]),
    MathUtils.degToRad(rotationDegrees[2]),
  )
  building.scale.setScalar(scale)
}

function round(value: number) {
  return Number(value.toFixed(3))
}
