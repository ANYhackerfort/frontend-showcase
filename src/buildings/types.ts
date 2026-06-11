import type { SplatMeshOptions } from '@sparkjsdev/spark'

export type Vec3 = [number, number, number]
export type QuaternionTuple = [number, number, number, number]

export type SplatBuildingConfig = {
  name: string
  url: string
  position?: Vec3
  rotation?: Vec3
  rotationDegrees?: Vec3
  scale?: number | Vec3
  assetQuaternion?: QuaternionTuple
  options?: Omit<SplatMeshOptions, 'url'>
}
