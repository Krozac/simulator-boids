import { Boid } from './boid.js';
let tracingEnabled = false; // Activer ou désactiver le traçage
export function startSimulation(ctx) {
    const canvas = ctx.canvas;
    const boids = [];
    for (let i = 0; i < 500; i++) {
        boids.push(new Boid(Math.random() * canvas.width, Math.random() * canvas.height));
    }
    function drawTrail(boid) {
        if (!tracingEnabled)
            return;
        ctx.beginPath();
        for (let i = 0; i < boid.trail.length - 1; i++) {
            const start = boid.trail[i];
            const end = boid.trail[i + 1];
            ctx.moveTo(start.x, start.y);
            ctx.lineTo(end.x, end.y);
        }
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
        ctx.lineWidth = 1;
        ctx.stroke();
    }
    function drawBoid(boid) {
        const size = 10;
        const angle = Math.atan2(boid.velocity.y, boid.velocity.x);
        ctx.save();
        ctx.translate(boid.position.x, boid.position.y);
        ctx.rotate(angle);
        ctx.beginPath();
        ctx.moveTo(0, -size / 2);
        ctx.lineTo(-size / 2, size / 2);
        ctx.lineTo(size, size / 2);
        ctx.closePath();
        ctx.fillStyle = 'rgba(255,255,255, 0.5)';
        ctx.fill();
        ctx.restore();
    }
    function simulate() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        for (const boid of boids) {
            boid.flock(boids);
            boid.update(canvas.width, canvas.height);
            drawTrail(boid); // Dessiner la trajectoire
            drawBoid(boid);
        }
        requestAnimationFrame(simulate);
    }
    simulate();
}
export function addTracingToggle() {
    const toggleButton = document.createElement('button');
    toggleButton.textContent = 'Toggle Tracing';
    toggleButton.style.position = 'absolute';
    toggleButton.style.top = '10px';
    toggleButton.style.right = '10px';
    toggleButton.style.zIndex = '10';
    toggleButton.addEventListener('click', () => {
        tracingEnabled = !tracingEnabled;
    });
    document.body.appendChild(toggleButton);
}
