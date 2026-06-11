import {
  Euler,
  type Intersection,
  MathUtils,
  type Object3D,
  PerspectiveCamera,
  Quaternion,
  Raycaster,
  Vector3,
} from 'three'

const pressedKeys = new Set<string>()
const movement = new Vector3()
const forward = new Vector3()
const right = new Vector3()
const horizontalStep = new Vector3()
const up = new Vector3(0, 1, 0)
const nextPosition = new Vector3()
const nextRotation = new Quaternion()
const rayOrigin = new Vector3()
const cameraEuler = new Euler(0, 0, 0, 'YXZ')
const down = new Vector3(0, -1, 0)

const EYE_HEIGHT = 0.06
const WALK_SPEED = 0.45
const RUN_MULTIPLIER = 2.15
const FLY_SPEED = 0.55
const LOOK_SPEED = 0.0022
const WALK_LIMIT = 38
const FLY_MIN_HEIGHT = 0.06
const FLY_MAX_HEIGHT = 18
const JUMP_SPEED = 1.65
const FALL_GRAVITY = 9.8
const JUMP_GRAVITY = 5.2
const HEAD_BOB_AMPLITUDE = 0.01
const HEAD_BOB_FREQUENCY = 12
const GROUND_CHECK_INTERVAL = 0.1
const GROUND_CHECK_RAY_LENGTH = 1.4
const SURFACE_SNAP_DISTANCE = 0.08
const SAVE_INTERVAL_MS = 250
const STORAGE_KEY = 'splat-walkthrough-camera'

const movementKeys = new Set([
  'ArrowDown',
  'ArrowLeft',
  'ArrowRight',
  'ArrowUp',
  'KeyA',
  'KeyD',
  'KeyE',
  'KeyQ',
  'KeyS',
  'KeyW',
  'ShiftLeft',
  'ShiftRight',
  'Space',
])

type SavedCameraState = {
  position: [number, number, number]
  yaw: number
  pitch: number
}

export class WalkController {
  private yaw = 0
  private pitch = 0
  private verticalVelocity = 0
  private isGrounded = true
  private isHovering = false
  private isJumping = false
  private headBobTime = 0
  private headBobOffset = 0
  private groundCheckElapsed = GROUND_CHECK_INTERVAL
  private disposed = false
  private lastSaveAt = 0
  private hasUnsavedState = false
  private readonly raycaster = new Raycaster()
  private readonly rayHits: Intersection[] = []
  private readonly bodyPosition = new Vector3()
  private readonly canvas: HTMLCanvasElement
  private readonly camera: PerspectiveCamera
  private readonly walkableSurface: Object3D | null

  constructor(
    canvas: HTMLCanvasElement,
    camera: PerspectiveCamera,
    walkableSurface: Object3D | null = null,
  ) {
    this.canvas = canvas
    this.camera = camera
    this.walkableSurface = walkableSurface
    this.restoreCameraState()
    this.canvas.addEventListener('click', this.requestPointerLock)
    window.addEventListener('mousemove', this.handleMouseMove)
    window.addEventListener('keydown', this.handleKeyDown)
    window.addEventListener('keyup', this.handleKeyUp)
  }

  update(delta: number) {
    if (this.disposed) {
      return
    }

    cameraEuler.set(this.pitch, this.yaw, 0)
    this.camera.quaternion.copy(nextRotation.setFromEuler(cameraEuler))

    movement.set(0, 0, 0)

    if (pressedKeys.has('KeyW') || pressedKeys.has('ArrowUp')) {
      movement.z += 1
    }

    if (pressedKeys.has('KeyS') || pressedKeys.has('ArrowDown')) {
      movement.z -= 1
    }

    if (pressedKeys.has('KeyA') || pressedKeys.has('ArrowLeft')) {
      movement.x -= 1
    }

    if (pressedKeys.has('KeyD') || pressedKeys.has('ArrowRight')) {
      movement.x += 1
    }

    const hasGroundMovement = movement.lengthSq() > 0
    const speed =
      WALK_SPEED *
      (pressedKeys.has('ShiftLeft') || pressedKeys.has('ShiftRight')
        ? RUN_MULTIPLIER
        : 1)
    let hasPositionChanged = false

    nextPosition.copy(this.bodyPosition)

    if (hasGroundMovement) {
      movement.normalize()
      forward.set(0, 0, -1).applyAxisAngle(up, this.yaw)
      right.set(1, 0, 0).applyAxisAngle(up, this.yaw)

      horizontalStep
        .set(0, 0, 0)
        .addScaledVector(forward, movement.z * speed * delta)
        .addScaledVector(right, movement.x * speed * delta)

      if (horizontalStep.lengthSq() > 0) {
        nextPosition.add(horizontalStep)
        hasPositionChanged = true
      }
    }

    const isFlying = pressedKeys.has('KeyE') || pressedKeys.has('KeyQ')

    if (pressedKeys.has('KeyE')) {
      nextPosition.y += FLY_SPEED * delta
      this.verticalVelocity = 0
      this.isGrounded = false
      this.isHovering = true
      this.isJumping = false
      hasPositionChanged = true
    }

    if (pressedKeys.has('KeyQ')) {
      nextPosition.y -= FLY_SPEED * delta
      this.verticalVelocity = 0
      this.isHovering = true
      this.isJumping = false
      hasPositionChanged = true
    }

    if (!isFlying && !this.isHovering && (!this.isGrounded || this.verticalVelocity > 0)) {
      this.verticalVelocity -= (this.isJumping ? JUMP_GRAVITY : FALL_GRAVITY) * delta
      nextPosition.y += this.verticalVelocity * delta
      hasPositionChanged = true
    }

    nextPosition.x = MathUtils.clamp(nextPosition.x, -WALK_LIMIT, WALK_LIMIT)
    nextPosition.z = MathUtils.clamp(nextPosition.z, -WALK_LIMIT, WALK_LIMIT)
    nextPosition.y = MathUtils.clamp(nextPosition.y, FLY_MIN_HEIGHT, FLY_MAX_HEIGHT)

    const walkableSurfaceState = this.checkWalkableSurface(
      nextPosition,
      isFlying,
      delta,
    )

    if (nextPosition.y <= EYE_HEIGHT) {
      nextPosition.y = EYE_HEIGHT
      this.verticalVelocity = 0
      this.isGrounded = true
      this.isHovering = false
      this.isJumping = false
    } else if (walkableSurfaceState === true) {
      this.verticalVelocity = 0
      this.isGrounded = true
      this.isHovering = false
      this.isJumping = false
    } else if (walkableSurfaceState === false && this.isGrounded && !isFlying) {
      this.verticalVelocity = 0
      this.isGrounded = false
      this.isHovering = false
      this.isJumping = false
    }

    this.bodyPosition.copy(nextPosition)
    this.updateHeadBob(delta, hasGroundMovement && this.isGrounded)
    this.camera.position.copy(this.bodyPosition)
    this.camera.position.y += this.headBobOffset

    if (hasPositionChanged) {
      this.markStateChanged()
    }

    this.saveCameraState()
  }

  dispose() {
    this.disposed = true
    this.saveCameraState(true)
    pressedKeys.clear()
    this.canvas.removeEventListener('click', this.requestPointerLock)
    window.removeEventListener('mousemove', this.handleMouseMove)
    window.removeEventListener('keydown', this.handleKeyDown)
    window.removeEventListener('keyup', this.handleKeyUp)
  }

  private requestPointerLock = () => {
    this.canvas.requestPointerLock()
  }

  private handleMouseMove = (event: MouseEvent) => {
    if (document.pointerLockElement !== this.canvas) {
      return
    }

    this.yaw -= event.movementX * LOOK_SPEED
    this.pitch -= event.movementY * LOOK_SPEED
    this.pitch = MathUtils.clamp(this.pitch, -1.35, 1.35)
    this.markStateChanged()
  }

  private handleKeyDown = (event: KeyboardEvent) => {
    if (movementKeys.has(event.code)) {
      event.preventDefault()
    }

    if (event.code === 'Space' && this.isGrounded) {
      this.verticalVelocity = JUMP_SPEED
      this.isGrounded = false
      this.isHovering = false
      this.isJumping = true
    }

    pressedKeys.add(event.code)
  }

  private handleKeyUp = (event: KeyboardEvent) => {
    if (movementKeys.has(event.code)) {
      event.preventDefault()
    }

    pressedKeys.delete(event.code)
  }

  private restoreCameraState() {
    const savedState = this.readCameraState()

    if (!savedState) {
      this.bodyPosition.set(0, EYE_HEIGHT, 8)
      this.camera.position.copy(this.bodyPosition)
      return
    }

    this.yaw = savedState.yaw
    this.pitch = MathUtils.clamp(savedState.pitch, -1.35, 1.35)
    this.bodyPosition.set(
      MathUtils.clamp(savedState.position[0], -WALK_LIMIT, WALK_LIMIT),
      MathUtils.clamp(savedState.position[1], FLY_MIN_HEIGHT, FLY_MAX_HEIGHT),
      MathUtils.clamp(savedState.position[2], -WALK_LIMIT, WALK_LIMIT),
    )
    this.camera.position.copy(this.bodyPosition)
    this.isGrounded = this.bodyPosition.y <= EYE_HEIGHT
  }

  private readCameraState() {
    try {
      const rawState = window.localStorage.getItem(STORAGE_KEY)

      if (!rawState) {
        return null
      }

      const state = JSON.parse(rawState) as Partial<SavedCameraState>

      if (
        !Array.isArray(state.position) ||
        state.position.length !== 3 ||
        typeof state.yaw !== 'number' ||
        typeof state.pitch !== 'number' ||
        !state.position.every((value) => typeof value === 'number')
      ) {
        return null
      }

      return state as SavedCameraState
    } catch {
      return null
    }
  }

  private markStateChanged() {
    this.hasUnsavedState = true
  }

  private saveCameraState(force = false) {
    if (!this.hasUnsavedState && !force) {
      return
    }

    const now = performance.now()

    if (!force && now - this.lastSaveAt < SAVE_INTERVAL_MS) {
      return
    }

    try {
      const state: SavedCameraState = {
        position: this.bodyPosition.toArray(),
        yaw: this.yaw,
        pitch: this.pitch,
      }

      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
      this.lastSaveAt = now
      this.hasUnsavedState = false
    } catch {
      this.hasUnsavedState = false
    }
  }

  private updateHeadBob(delta: number, isMovingOnGround: boolean) {
    const targetOffset = isMovingOnGround
      ? Math.sin(this.headBobTime) * HEAD_BOB_AMPLITUDE
      : 0

    if (isMovingOnGround) {
      this.headBobTime += delta * HEAD_BOB_FREQUENCY
    }

    this.headBobOffset +=
      (targetOffset - this.headBobOffset) * Math.min(1, delta * 14)
  }

  private checkWalkableSurface(
    position: Vector3,
    isFlying: boolean,
    delta: number,
  ) {
    this.groundCheckElapsed += delta

    if (
      isFlying ||
      this.verticalVelocity > 0 ||
      !this.walkableSurface ||
      this.groundCheckElapsed < GROUND_CHECK_INTERVAL
    ) {
      return null
    }

    this.groundCheckElapsed = 0
    rayOrigin.copy(position)
    this.raycaster.set(rayOrigin, down)
    this.raycaster.near = 0
    this.raycaster.far = GROUND_CHECK_RAY_LENGTH

    this.rayHits.length = 0
    this.raycaster.intersectObject(this.walkableSurface, true, this.rayHits)
    const [hit] = this.rayHits

    if (!hit) {
      return false
    }

    const surfaceY = hit.point.y + EYE_HEIGHT

    if (position.y > surfaceY + SURFACE_SNAP_DISTANCE) {
      return false
    }

    position.y = MathUtils.clamp(surfaceY, FLY_MIN_HEIGHT, FLY_MAX_HEIGHT)
    return true
  }
}
