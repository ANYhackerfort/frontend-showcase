# Splat Assets

Drop local `.spz`, `.ply`, `.splat`, `.ksplat`, or `.sog` files here and reference
them from a building component with a public URL such as:

```ts
const MY_BUILDING = '/splats/my-building.spz'
```

`src/buildings/EntryPavilion.tsx` is an example component for a future local
asset. It is not rendered until you import it in `src/buildings/Buildings.tsx`.
