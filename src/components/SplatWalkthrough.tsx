import { useEffect, useRef, useState } from 'react'
import {
  createWalkthroughScene,
  type ProximityBuilding,
} from '../scene/createWalkthroughScene'

export function SplatWalkthrough() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const [proximityBuilding, setProximityBuilding] =
    useState<ProximityBuilding | null>(null)

  useEffect(() => {
    if (!canvasRef.current) {
      return undefined
    }

    return createWalkthroughScene(canvasRef.current, {
      onProximityBuildingChange: setProximityBuilding,
    })
  }, [])

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
    </main>
  )
}
