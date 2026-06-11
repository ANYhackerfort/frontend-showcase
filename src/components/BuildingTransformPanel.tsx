import type {
  BuildingTransform,
  BuildingTransformHandle,
} from '../scene/buildingTransformControls'

type BuildingTransformPanelProps = {
  handles: BuildingTransformHandle[]
  transforms: Record<string, BuildingTransform>
  onChange: (name: string, transform: BuildingTransform) => void
}

const POSITION_RANGE = {
  min: -60,
  max: 60,
  step: 0.1,
}

const HEIGHT_RANGE = {
  min: -10,
  max: 30,
  step: 0.1,
}

const ROTATION_RANGE = {
  min: -180,
  max: 180,
  step: 1,
}

const SCALE_RANGE = {
  min: 0.05,
  max: 12,
  step: 0.05,
}

export function BuildingTransformPanel({
  handles,
  transforms,
  onChange,
}: BuildingTransformPanelProps) {
  if (handles.length === 0) {
    return null
  }

  return (
    <aside className="transform-panel" onMouseDown={(event) => event.stopPropagation()}>
      {handles.map((handle) => {
        const transform = transforms[handle.name]

        if (!transform) {
          return null
        }

        return (
          <section className="transform-panel__building" key={handle.name}>
            <h2>{handle.name}</h2>
            <TransformSliderGroup
              label="Position"
              values={transform.position}
              ranges={[POSITION_RANGE, HEIGHT_RANGE, POSITION_RANGE]}
              axes={['x', 'y', 'z']}
              onChange={(position) =>
                onChange(handle.name, { ...transform, position })
              }
            />
            <TransformSliderGroup
              label="Rotation"
              values={transform.rotationDegrees}
              ranges={[ROTATION_RANGE, ROTATION_RANGE, ROTATION_RANGE]}
              axes={['x', 'y', 'z']}
              suffix="deg"
              onChange={(rotationDegrees) =>
                onChange(handle.name, { ...transform, rotationDegrees })
              }
            />
            <TransformSlider
              label="Scale"
              value={transform.scale}
              range={SCALE_RANGE}
              onChange={(scale) => onChange(handle.name, { ...transform, scale })}
            />
            <pre>{formatTransform(transform)}</pre>
          </section>
        )
      })}
    </aside>
  )
}

type SliderRange = {
  min: number
  max: number
  step: number
}

type TransformSliderGroupProps = {
  label: string
  values: [number, number, number]
  ranges: [SliderRange, SliderRange, SliderRange]
  axes: [string, string, string]
  suffix?: string
  onChange: (values: [number, number, number]) => void
}

function TransformSliderGroup({
  label,
  values,
  ranges,
  axes,
  suffix,
  onChange,
}: TransformSliderGroupProps) {
  return (
    <div className="transform-panel__group">
      <span>{label}</span>
      {values.map((value, index) => (
        <TransformSlider
          axis={axes[index]}
          key={axes[index]}
          label={`${label} ${axes[index]}`}
          range={ranges[index]}
          suffix={suffix}
          value={value}
          onChange={(nextValue) => {
            const nextValues: [number, number, number] = [...values]
            nextValues[index] = nextValue
            onChange(nextValues)
          }}
        />
      ))}
    </div>
  )
}

type TransformSliderProps = {
  label: string
  value: number
  range: SliderRange
  axis?: string
  suffix?: string
  onChange: (value: number) => void
}

function TransformSlider({
  label,
  value,
  range,
  axis,
  suffix,
  onChange,
}: TransformSliderProps) {
  return (
    <label className="transform-panel__slider">
      <span>{axis ?? label}</span>
      <input
        aria-label={label}
        max={range.max}
        min={range.min}
        step={range.step}
        type="range"
        value={value}
        onChange={(event) => onChange(Number(event.target.value))}
      />
      <output>
        {formatNumber(value)}
        {suffix}
      </output>
    </label>
  )
}

function formatTransform({ position, rotationDegrees, scale }: BuildingTransform) {
  return `position: [${position.map(formatNumber).join(', ')}]
rotationDegrees: [${rotationDegrees.map(formatNumber).join(', ')}]
scale: ${formatNumber(scale)}`
}

function formatNumber(value: number) {
  return Number(value.toFixed(3)).toString()
}
