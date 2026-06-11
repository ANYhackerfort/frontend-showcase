import { SparkRenderer } from '@sparkjsdev/spark'
import {
  AmbientLight,
  Color,
  DirectionalLight,
  Fog,
  Group,
  HemisphereLight,
  PerspectiveCamera,
  Scene,
  Vector3,
  WebGLRenderer,
} from 'three'
import { createBuildings } from '../buildings/Buildings'
import {
  createBuildingTransformHandle,
  type BuildingTransformHandle,
} from './buildingTransformControls'
import { createGroundPlane } from './createGroundPlane'
import { createSkyEnvironment } from './createSkyEnvironment'
import { WalkController } from './WalkController'

export type ProximityBuilding = {
  id: string
  title: string
  description: string
}

type WalkthroughSceneOptions = {
  onBuildingTransformsReady?: (handles: BuildingTransformHandle[]) => void
  onProximityBuildingChange?: (building: ProximityBuilding | null) => void
}

const PROXIMITY_RADIUS = 7
const adjustableBuildingNames = new Set(['HFH'])
const proximityBuildingCopy: Record<string, ProximityBuilding> = {
  MRL: {
    id: 'MRL',
    title: 'Approaching MRL',
    description:
      'You are approaching the Materials Research Laboratory, UCSB\'s interdisciplinary hub for materials science. The lab began as an NSF-backed center in the early 1990s and continues to support shared facilities, research training, and collaborations around new materials.',
  },
  Kvali: {
    id: 'Kvali',
    title: 'Approaching Kavli / Kohn Hall',
    description:
      'You are approaching Kohn Hall, home of the Kavli Institute for Theoretical Physics. Named for Nobel laureate Walter Kohn, the building was designed to bring theorists together with courtyards, blackboards, and gathering spaces for long-form scientific collaboration.',
  },
  HFH: {
    id: 'HFH',
    title: 'Approaching Harold Frank Hall',
    description:
      'You are approaching Harold Frank Hall, a 60,000-square-foot UCSB Engineering building with Computer Science and Electrical and Computer Engineering offices and labs. The building was named in 2006 for Diana and Harold Frank, supporters of UCSB Engineering.',
  },
}
const proximityTargetPosition = new Vector3()

function findProximityBuilding(
  buildings: Group[],
  x: number,
  z: number,
): ProximityBuilding | null {
  let nearestBuilding: ProximityBuilding | null = null
  let nearestDistanceSq = PROXIMITY_RADIUS * PROXIMITY_RADIUS

  for (const building of buildings) {
    const proximityBuilding = proximityBuildingCopy[building.name]

    if (!proximityBuilding) {
      continue
    }

    building.getWorldPosition(proximityTargetPosition)

    const dx = proximityTargetPosition.x - x
    const dz = proximityTargetPosition.z - z
    const distanceSq = dx * dx + dz * dz

    if (distanceSq <= nearestDistanceSq) {
      nearestDistanceSq = distanceSq
      nearestBuilding = proximityBuilding
    }
  }

  return nearestBuilding
}

export function createWalkthroughScene(
  canvas: HTMLCanvasElement,
  options: WalkthroughSceneOptions = {},
) {
  const scene = new Scene()
  const camera = new PerspectiveCamera(62, 1, 0.01, 1000)
  const renderer = new WebGLRenderer({
    canvas,
    antialias: false,
    alpha: false,
    powerPreference: 'high-performance',
  })
  const ground = createGroundPlane(renderer.capabilities.getMaxAnisotropy())
  const sky = createSkyEnvironment(scene)
  const spark = new SparkRenderer({
    renderer,
    focalAdjustment: 2,
    minSortIntervalMs: 16,
    sortRadial: true,
  })
  const buildings = createBuildings()
  const walkableSurface = new Group()
  const controls = new WalkController(canvas, camera, walkableSurface)
  const buildingTransformHandles = buildings
    .filter((building) => adjustableBuildingNames.has(building.name))
    .map(createBuildingTransformHandle)
  let activeProximityBuildingId: string | null = null
  let lastFrame = performance.now()

  scene.background = new Color('#02030a')
  scene.fog = new Fog('#03040a', 16, 52)
  scene.add(ground.plane)
  scene.add(new AmbientLight('#10152a', 0.05))
  scene.add(new HemisphereLight('#223154', '#020308', 0.08))

  const moon = new DirectionalLight('#9fb8ff', 0.18)
  moon.position.set(-8, 12, 4)
  moon.castShadow = true
  moon.shadow.mapSize.set(2048, 2048)
  scene.add(moon)
  walkableSurface.add(...buildings)
  scene.add(walkableSurface)
  scene.add(spark)
  options.onBuildingTransformsReady?.(buildingTransformHandles)

  const resize = () => {
    const width = canvas.clientWidth || window.innerWidth
    const height = canvas.clientHeight || window.innerHeight

    camera.aspect = width / height
    camera.updateProjectionMatrix()
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    renderer.setSize(width, height, false)
  }

  const render = () => {
    const now = performance.now()
    const delta = Math.min((now - lastFrame) / 1000, 0.1)

    lastFrame = now
    controls.update(delta)

    const proximityBuilding = findProximityBuilding(
      buildings,
      camera.position.x,
      camera.position.z,
    )

    if (proximityBuilding?.id !== activeProximityBuildingId) {
      activeProximityBuildingId = proximityBuilding?.id ?? null
      options.onProximityBuildingChange?.(proximityBuilding)
    }

    renderer.render(scene, camera)
  }

  resize()
  window.addEventListener('resize', resize)
  renderer.setAnimationLoop(render)

  return () => {
    renderer.setAnimationLoop(null)
    window.removeEventListener('resize', resize)
    controls.dispose()
    sky.dispose()
    ground.dispose()
    scene.remove(walkableSurface)
    buildings.forEach((building) => {
      building.traverse((object) => {
        if ('dispose' in object && typeof object.dispose === 'function') {
          object.dispose()
        }
      })
    })
    scene.remove(spark)
    spark.dispose()
    renderer.dispose()
  }
}
