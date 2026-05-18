export const GameLoop = (() => {
    let running = false;
    let frameId = null;
    let fps = 0;
    let fpsFrameCount = 0;
    let fpsTimer = 0;
    // callbacks
    let updateCallback = null;
    let renderCallback = null;
    // timing
    let fixedDt = 1 / 30; // seconds
    let accumulator = 0;
    let lastTime = 0;
    // prevent spiral of death when tab was inactive
    const MAX_FRAME_TIME = 0.25; // seconds
    function loop(timestamp) {
        if (!running)
            return;
        if (!lastTime)
            lastTime = timestamp;
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
            updateCallback === null || updateCallback === void 0 ? void 0 : updateCallback(fixedDt);
            accumulator -= fixedDt;
        }
        // ⭐ render once per frame
        // alpha = interpolation factor (0..1)
        const alpha = accumulator / fixedDt;
        renderCallback === null || renderCallback === void 0 ? void 0 : renderCallback(alpha);
        frameId = requestAnimationFrame(loop);
    }
    function start(options) {
        var _a, _b;
        if (running)
            return;
        updateCallback = options.onUpdate;
        renderCallback = (_a = options.onRender) !== null && _a !== void 0 ? _a : null;
        const fps = (_b = options.targetFps) !== null && _b !== void 0 ? _b : 30;
        fixedDt = 1 / fps;
        accumulator = 0;
        lastTime = 0;
        running = true;
        frameId = requestAnimationFrame(loop);
    }
    function stop() {
        if (!running)
            return;
        running = false;
        if (frameId !== null) {
            cancelAnimationFrame(frameId);
            frameId = null;
        }
    }
    function isRunning() {
        return running;
    }
    function getFps() {
        return fps;
    }
    return {
        start,
        stop,
        isRunning,
        getFps
    };
})();
