import { EntityManager } from './entities/entityManager.js';
import { BoidEntity } from './entities/ent_boid.js';
import { BoidSystem } from './systems/sys_boid.js';
import { MovementSystem } from './systems/sys_movement.js';
import { CursorSystem } from './systems/sys_cursor.js';
import { DrawSystem } from './systems/sys_draw.js';
import { CursorTag } from './components/tgs_cursor.js';
import { InputState } from './components/tgs_cursor.js';
import { GameLoop } from "./gameloop.js";
import { ObstacleEntity } from './entities/ent_obstacle.js';
let entityManager;
let boidSystem;
let movementSystem;
let drawSystem;
let cursorSystem;
let canvas;
let ctx;
let rafId = null;
let resizeHandler = null;
let running = false;
const WORLD_WIDTH = 700;
const WORLD_HEIGHT = 500;
let fpsEl = null;
function resizeCanvas(canvas) {
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width;
    canvas.height = rect.height;
}
function applyLetterbox(ctx, canvas) {
    const scale = Math.min(canvas.width / WORLD_WIDTH, canvas.height / WORLD_HEIGHT);
    const offsetX = (canvas.width - WORLD_WIDTH * scale) / 2;
    const offsetY = (canvas.height - WORLD_HEIGHT * scale) / 2;
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.setTransform(scale, 0, 0, scale, offsetX, offsetY);
}
function init(context, options = {}) {
    var _a, _b;
    ctx = context;
    canvas = context.canvas;
    console.log(options);
    entityManager = new EntityManager();
    boidSystem = new BoidSystem(entityManager, (_a = options.use_spatial_grid) !== null && _a !== void 0 ? _a : false);
    movementSystem = new MovementSystem();
    drawSystem = new DrawSystem(context);
    cursorSystem = new CursorSystem();
    resizeCanvas(canvas);
    resizeHandler = () => resizeCanvas(canvas);
    window.addEventListener('resize', () => resizeHandler);
    running = true;
    boidSystem.canvasWidth = WORLD_WIDTH;
    boidSystem.canvasHeight = WORLD_HEIGHT;
    for (let i = 0; i < options.boid_count; i++) {
        const boidEntity = new BoidEntity(entityManager, Math.random() * WORLD_WIDTH, Math.random() * WORLD_HEIGHT);
    }
    canvas.addEventListener("mousemove", (e) => {
        const rect = canvas.getBoundingClientRect();
        const screenX = e.clientX - rect.left;
        const screenY = e.clientY - rect.top;
        const scale = Math.min(canvas.width / WORLD_WIDTH, canvas.height / WORLD_HEIGHT);
        const offsetX = (canvas.width - WORLD_WIDTH * scale) / 2;
        const offsetY = (canvas.height - WORLD_HEIGHT * scale) / 2;
        // ⭐ convert to world space
        InputState.mouseX = (screenX - offsetX) / scale;
        InputState.mouseY = (screenY - offsetY) / scale;
    });
    if (options.obstacle_cursor) {
        let obstacle_cursor = new ObstacleEntity(entityManager, 0, 0, 50);
        entityManager.addComponent(obstacle_cursor.entityId, "Cursor", CursorTag());
    }
    if (options.show_fps) {
        fpsEl = document.createElement("p");
        fpsEl.style.position = "absolute";
        fpsEl.style.top = "8px";
        fpsEl.style.left = "8px";
        fpsEl.style.margin = "0";
        fpsEl.style.padding = "4px 6px";
        fpsEl.style.background = "rgba(0,0,0,0.5)";
        fpsEl.style.color = "#0f0";
        fpsEl.style.fontFamily = "monospace";
        fpsEl.style.fontSize = "12px";
        fpsEl.style.pointerEvents = "none";
        fpsEl.textContent = "FPS: --";
        fpsEl.style.zIndex = "100";
        (_b = canvas.parentElement) === null || _b === void 0 ? void 0 : _b.appendChild(fpsEl);
    }
}
function gameLoop() {
    if (!running)
        return;
    GameLoop.start({
        targetFps: 60,
        onUpdate: (dt) => {
            if (fpsEl) {
                fpsEl.textContent = `FPS: ${GameLoop.getFps()}`;
            }
            boidSystem.update(dt);
            movementSystem.update(entityManager, WORLD_WIDTH, WORLD_HEIGHT, dt);
            cursorSystem.update(entityManager);
        },
        onRender: () => {
            ctx.setTransform(1, 0, 0, 1, 0, 0);
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            applyLetterbox(ctx, canvas);
            drawSystem.update(entityManager);
        },
    });
}
function stop() {
    running = false;
    // stop the fixed game loop
    GameLoop.stop();
    // remove resize listener
    if (resizeHandler) {
        window.removeEventListener('resize', resizeHandler);
        resizeHandler = null;
    }
    // optional: clear canvas
    if (ctx && canvas) {
        ctx.setTransform(1, 0, 0, 1, 0, 0);
        ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
    if (fpsEl) {
        fpsEl.remove();
        fpsEl = null;
    }
}
window.init = init;
window.gameLoop = gameLoop;
window.stopSim = stop;
export { init, gameLoop, stop };
