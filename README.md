# Spark Splat Walkthrough

Vite + React + TypeScript scene for walking around multiple Gaussian splat
buildings with Three.js and `@sparkjsdev/spark`.

## Run

```sh
npm install
npm run dev
```

The dev server starts at `http://localhost:5173/` by default.

## Add A Building

1. Put your splat file in `public/splats/`, for example:

```text
public/splats/my-building.spz
```

2. Create a building file in `src/buildings/`:

```ts
import { createSplatBuilding } from './SplatBuilding'

export function createMyBuilding() {
  return createSplatBuilding({
    name: 'My Building',
    url: '/splats/my-building.spz',
    position: [0, 0, -4],
    rotation: [0, Math.PI / 2, 0],
    scale: 1,
  })
}
```

3. Import and return it from `src/buildings/Buildings.ts`.

Each building controls its own `position`, `rotation`, `scale`, and optional
Spark `options`. The shared scene setup lives in `src/scene/`.
