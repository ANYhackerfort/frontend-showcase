import { useEffect, useRef, useState } from 'react'
import { BuildingTransformPanel } from './BuildingTransformPanel'
import {
  createWalkthroughScene,
  type ProximityBuilding,
} from '../scene/createWalkthroughScene'
import type {
  BuildingTransform,
  BuildingTransformHandle,
} from '../scene/buildingTransformControls'

export function SplatWalkthrough() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const handlesRef = useRef<BuildingTransformHandle[]>([])
  const [handles, setHandles] = useState<BuildingTransformHandle[]>([])
  const [proximityBuilding, setProximityBuilding] =
    useState<ProximityBuilding | null>(null)
  const [transforms, setTransforms] = useState<Record<string, BuildingTransform>>(
    {},
  )

  useEffect(() => {
    if (!canvasRef.current) {
      return undefined
    }

    return createWalkthroughScene(canvasRef.current, {
      onBuildingTransformsReady: (nextHandles) => {
        handlesRef.current = nextHandles
        setHandles(nextHandles)
        setTransforms(
          Object.fromEntries(
            nextHandles.map((handle) => [handle.name, handle.transform]),
          ),
        )
      },
      onProximityBuildingChange: setProximityBuilding,
    })
  }, [])

  const handleTransformChange = (
    name: string,
    transform: BuildingTransform,
  ) => {
    setTransforms((currentTransforms) => ({
      ...currentTransforms,
      [name]: transform,
    }))
    handlesRef.current
      .find((handle) => handle.name === name)
      ?.applyTransform(transform)
  }

  return (
    <main className="app-shell">
      <canvas ref={canvasRef} className="scene-canvas" />
      <div className="scene-credit" aria-label="scene title">
        <span>3D Reconstruction Project</span>
        <span>Vision Lab UCSB 2026</span>
      </div>
      {proximityBuilding && (
        <aside className="proximity-panel" aria-live="polite">
          <p className="proximity-panel__eyebrow">Nearby</p>
          <h1>{proximityBuilding.title}</h1>
          <p>{proximityBuilding.description}</p>
        </aside>
      )}
      <BuildingTransformPanel
        handles={handles}
        transforms={transforms}
        onChange={handleTransformChange}
      />
    </main>
  )
}
