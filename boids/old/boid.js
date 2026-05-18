// Global parameters for boid behaviors
export const boidParams = {
    separationFactor: 0.05,
    alignmentFactor: 0.05,
    centeringFactor: 0.0005,
};
// src/Boid.ts
export class Boid {
    constructor(x, y) {
        this.position = { x, y };
        this.velocity = { x: Math.random() * 2 - 1, y: Math.random() * 2 - 1 };
        this.acceleration = { x: 0, y: 0 };
        this.trail = [];
        this.maxTrailLength = 50; // Longueur maximale du tracé
        this.turnfactor = 0.2;
        this.visualRange = 40;
        this.protectedRange = 8;
        this.maxspeed = 6;
        this.minspeed = 3;
    }
    update(canvasWidth, canvasHeight) {
        this.velocity.x += this.acceleration.x;
        this.velocity.y += this.acceleration.y;
        const speed = Math.sqrt(Math.pow(this.velocity.x, 2) + Math.pow(this.velocity.y, 2));
        if (speed > this.maxspeed) {
            this.velocity.x = (this.velocity.x / speed) * this.maxspeed;
            this.velocity.y = (this.velocity.y / speed) * this.maxspeed;
        }
        if (speed < this.minspeed) {
            this.velocity.x = (this.velocity.x / speed) * this.minspeed;
            this.velocity.y = (this.velocity.y / speed) * this.minspeed;
        }
        this.position.x += this.velocity.x;
        this.position.y += this.velocity.y;
        if (this.position.x < 50)
            this.velocity.x += this.turnfactor;
        if (this.position.x > canvasWidth - 50)
            this.velocity.x -= this.turnfactor;
        if (this.position.y < 50)
            this.velocity.y += this.turnfactor;
        if (this.position.y > canvasHeight - 50)
            this.velocity.y -= this.turnfactor;
        this.acceleration.x = 0;
        this.acceleration.y = 0;
        // Mise à jour de la trajectoire
        this.trail.push({ x: this.position.x, y: this.position.y });
        if (this.trail.length > this.maxTrailLength) {
            this.trail.shift(); // Supprimer les anciennes positions
        }
    }
    applyForce(force) {
        this.acceleration.x += force.x;
        this.acceleration.y += force.y;
    }
    draw(ctx) {
        ctx.beginPath();
        ctx.arc(this.position.x, this.position.y, 5, 0, Math.PI * 2);
        ctx.fill();
    }
    flock(boids) {
        this.alignment(boids);
        this.cohesion(boids);
        this.separation(boids);
    }
    separation(boids) {
        let close = { dx: 0, dy: 0 };
        for (const other of boids) {
            const distance = Math.sqrt(Math.pow((this.position.x - other.position.x), 2) + Math.pow((this.position.y - other.position.y), 2));
            if (distance < this.protectedRange && distance > 0) {
                close.dx += this.position.x - other.position.x;
                close.dy += this.position.y - other.position.y;
            }
        }
        this.velocity.x += close.dx * boidParams.separationFactor;
        this.velocity.y += close.dy * boidParams.separationFactor;
    }
    alignment(boids) {
        let xvel_avg = 0;
        let yvel_avg = 0;
        let neighboring_boids = 0;
        for (const other of boids) {
            const distance = Math.sqrt(Math.pow((this.position.x - other.position.x), 2) + Math.pow((this.position.y - other.position.y), 2));
            if (distance < this.visualRange && distance > 0) {
                xvel_avg += other.velocity.x;
                yvel_avg += other.velocity.y;
                neighboring_boids++;
            }
        }
        if (neighboring_boids > 0) {
            xvel_avg /= neighboring_boids;
            yvel_avg /= neighboring_boids;
        }
        this.velocity.x += (xvel_avg - this.velocity.x) * boidParams.alignmentFactor;
        this.velocity.y += (yvel_avg - this.velocity.y) * boidParams.alignmentFactor;
    }
    cohesion(boids) {
        let xpos_avg = 0;
        let ypos_avg = 0;
        let neighboring_boids = 0;
        for (const other of boids) {
            const distance = Math.sqrt(Math.pow((this.position.x - other.position.x), 2) + Math.pow((this.position.y - other.position.y), 2));
            if (distance < this.visualRange && distance > 0) {
                xpos_avg += other.position.x;
                ypos_avg += other.position.y;
                neighboring_boids++;
            }
        }
        if (neighboring_boids > 0) {
            xpos_avg /= neighboring_boids;
            ypos_avg /= neighboring_boids;
        }
        this.velocity.x += (xpos_avg - this.position.x) * boidParams.centeringFactor;
        this.velocity.y += (ypos_avg - this.position.y) * boidParams.centeringFactor;
    }
}
