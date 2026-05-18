export type UpdateCallback = (dt: number) => void;
export type RenderCallback = (alpha: number) => void;

export interface GameLoopOptions {
onUpdate: UpdateCallback;
onRender?: RenderCallback;
targetFps?: number; // simulation rate (default 30)
}

export const GameLoop = (() => {
let running = false;
let frameId: number | null = null;

let fps = 0;
let fpsFrameCount = 0;
let fpsTimer = 0;

// callbacks
let updateCallback: UpdateCallback | null = null;
let renderCallback: RenderCallback | null = null;

// timing
let fixedDt = 1 / 30; // seconds
let accumulator = 0;
let lastTime = 0;

// prevent spiral of death when tab was inactive
const MAX_FRAME_TIME = 0.25; // seconds

function loop(timestamp: number): void {
  if (!running) return;

  if (!lastTime) lastTime = timestamp;


  // convert ms → seconds
  let frameTime = (timestamp - lastTime) / 1000;
  lastTime = timestamp;

  // clamp huge pauses
  frameTime = Math.min(frameTime, MAX_FRAME_TIME);

  fpsFrameCount++;
  fpsTimer += frameTime;

  if (fpsTimer >= 1) {
    fps = fpsFrameCount;
    fpsFrameCount = 0;
    fpsTimer = 0;
  }

  accumulator += frameTime;

  // ⭐ fixed-step simulation
  while (accumulator >= fixedDt) {
    updateCallback?.(fixedDt);
    accumulator -= fixedDt;
  }

  // ⭐ render once per frame
  // alpha = interpolation factor (0..1)
  const alpha = accumulator / fixedDt;
  renderCallback?.(alpha);

  frameId = requestAnimationFrame(loop);

}

function start(options: GameLoopOptions): void {
  if (running) return;

  updateCallback = options.onUpdate;
  renderCallback = options.onRender ?? null;

  const fps = options.targetFps ?? 30;
  fixedDt = 1 / fps;

  accumulator = 0;
  lastTime = 0;
  running = true;

  frameId = requestAnimationFrame(loop);

  }

  function stop(): void {
  if (!running) return;

  running = false;

  if (frameId !== null) {
    cancelAnimationFrame(frameId);
    frameId = null;
  }

}

function isRunning(): boolean {
  return running;
}

function getFps(): number {
  return fps;
}

return {
  start,
  stop,
  isRunning,
  getFps
};
})();
