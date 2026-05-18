import { SpatialGrid } from "../../helpers/hel_grid.js";
export class BoidSystem {
    constructor(entityManager, useSpatialGrid) {
        this.useSpatialGrid = false;
        this.grid = null;
        this.entityManager = entityManager;
        this.useSpatialGrid = useSpatialGrid;
        if (useSpatialGrid) {
            this.grid = new SpatialGrid(10);
        }
        this.boidParams = {
            separationFactor: 6,
            alignmentFactor: 4,
            centeringFactor: 0.8,
        };
        this.canvasWidth = 0;
        this.canvasHeight = 0;
    }
    update(dt) {
        const entities = this.entityManager.getEntities();
        console.log(this.useSpatialGrid);
        if (this.useSpatialGrid && this.grid) {
            this.grid.clear();
            entities.forEach((components, entityId) => {
                const pos = components.get('Position');
                if (pos) {
                    this.grid.insert(entityId, pos.x, pos.y);
                }
            });
        }
        entities.forEach((components, entityId) => {
            const boid = components.get('Boid');
            const position = components.get('Position');
            const velocity = components.get('Velocity');
            const acceleration = components.get('Acceleration');
            if (boid && position && velocity && acceleration) {
                this.applyupdate(entityId, position, velocity, boid, acceleration, dt);
                this.applySeparation(entityId, position, velocity, boid, dt);
                this.applyAlignment(entityId, position, velocity, boid, dt);
                this.applyCentering(entityId, position, velocity, boid, dt);
                this.applyObstacleAvoidance(entityId, position, velocity, boid, dt);
            }
        });
    }
    applyupdate(entityId, position, velocity, boid, acceleration, dt) {
        //console.log(velocity)
        velocity.x += acceleration.x * dt;
        velocity.y += acceleration.y * dt;
        const speed = Math.sqrt(Math.pow(velocity.x, 2) + Math.pow(velocity.y, 2));
        if (speed > boid.maxSpeed) {
            velocity.x = (velocity.x / speed) * boid.maxSpeed;
            velocity.y = (velocity.y / speed) * boid.maxSpeed;
        }
        else if (speed < boid.minSpeed && speed !== 0) {
            velocity.x = (velocity.x / speed) * boid.minSpeed;
            velocity.y = (velocity.y / speed) * boid.minSpeed;
        }
        else if (speed === 0) {
            velocity.x = boid.minSpeed;
            velocity.y = boid.minSpeed;
        }
        if (position.x < this.canvasWidth)
            velocity.x += boid.turnFactor;
        if (position.x > 0)
            velocity.x -= boid.turnFactor;
        if (position.y < this.canvasHeight)
            velocity.y += boid.turnFactor;
        if (position.y > 0)
            velocity.y -= boid.turnFactor;
        acceleration.x = 0;
        acceleration.y = 0;
    }
    applySeparation(entityId, position, velocity, boid, dt) {
        const neighborIds = this.getNeighborIds(entityId, position);
        let close = { dx: 0, dy: 0 };
        neighborIds.forEach((otherEntityId) => {
            if (entityId === otherEntityId)
                return;
            const otherComponents = this.entityManager.getEntities().get(otherEntityId);
            if (!otherComponents)
                return;
            const otherPosition = otherComponents.get('Position');
            const otherBoid = otherComponents.get('Boid');
            if (otherPosition && otherBoid) {
                const distance = Math.sqrt(Math.pow((position.x - otherPosition.x), 2) + Math.pow((position.y - otherPosition.y), 2));
                if (distance < boid.protectedRange && distance > 0) {
                    close.dx += position.x - otherPosition.x;
                    close.dy += position.y - otherPosition.y;
                }
            }
        });
        velocity.x += close.dx * this.boidParams.separationFactor * dt;
        velocity.y += close.dy * this.boidParams.separationFactor * dt;
    }
    applyAlignment(entityId, position, velocity, boid, dt) {
        let xvel_avg = 0;
        let yvel_avg = 0;
        let neighboring_boids = 0;
        const neighborIds = this.getNeighborIds(entityId, position);
        neighborIds.forEach((otherEntityId) => {
            if (entityId === otherEntityId)
                return;
            const otherComponents = this.entityManager.getEntities().get(otherEntityId);
            if (!otherComponents)
                return;
            const otherPosition = otherComponents.get('Position');
            const otherBoid = otherComponents.get('Boid');
            const otherVelocity = otherComponents.get('Velocity');
            if (otherPosition && otherBoid && otherVelocity) {
                const distance = Math.sqrt(Math.pow((position.x - otherPosition.x), 2) + Math.pow((position.y - otherPosition.y), 2));
                if (distance < boid.visualRange && distance > 0) {
                    xvel_avg += otherVelocity.x;
                    yvel_avg += otherVelocity.y;
                    neighboring_boids++;
                }
            }
        });
        if (neighboring_boids > 0) {
            xvel_avg /= neighboring_boids;
            yvel_avg /= neighboring_boids;
        }
        velocity.x += (xvel_avg - velocity.x) * this.boidParams.alignmentFactor * dt;
        velocity.y += (yvel_avg - velocity.y) * this.boidParams.alignmentFactor * dt;
    }
    applyCentering(entityId, position, velocity, boid, dt) {
        let xpos_avg = 0;
        let ypos_avg = 0;
        let neighboring_boids = 0;
        const neighborIds = this.getNeighborIds(entityId, position);
        neighborIds.forEach((otherEntityId) => {
            if (entityId === otherEntityId)
                return;
            const otherComponents = this.entityManager.getEntities().get(otherEntityId);
            if (!otherComponents)
                return;
            const otherPosition = otherComponents.get('Position');
            const otherBoid = otherComponents.get('Boid');
            if (otherPosition && otherBoid) {
                const distance = Math.sqrt(Math.pow((position.x - otherPosition.x), 2) + Math.pow((position.y - otherPosition.y), 2));
                if (distance < boid.visualRange && distance > 0) {
                    xpos_avg += otherPosition.x;
                    ypos_avg += otherPosition.y;
                    neighboring_boids++;
                }
            }
        });
        if (neighboring_boids > 0) {
            xpos_avg /= neighboring_boids;
            ypos_avg /= neighboring_boids;
        }
        velocity.x += (xpos_avg - position.x) * this.boidParams.centeringFactor * dt;
        velocity.y += (ypos_avg - position.y) * this.boidParams.centeringFactor * dt;
    }
    applyObstacleAvoidance(entityId, position, velocity, boid, dt) {
        const entities = this.entityManager.getEntities();
        let avoid = { dx: 0, dy: 0 };
        entities.forEach((components, otherId) => {
            const obstacle = components.get("Obstacle");
            const otherPos = components.get("Position");
            if (!obstacle || !otherPos)
                return;
            const dx = position.x - otherPos.x;
            const dy = position.y - otherPos.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            const minDist = obstacle.radius + boid.avoidRange;
            if (dist < minDist && dist > 0) {
                // stronger push when closer
                const strength = (minDist - dist) / minDist;
                avoid.dx += (dx / dist) * strength;
                avoid.dy += (dy / dist) * strength;
            }
        });
        velocity.x += avoid.dx * boid.avoidFactor * dt;
        velocity.y += avoid.dy * boid.avoidFactor * dt;
    }
    getNeighborIds(entityId, position) {
        if (this.useSpatialGrid && this.grid) {
            return this.grid.getNearby(position.x, position.y);
        }
        // fallback = all entities
        return Array.from(this.entityManager.getEntities().keys());
    }
}
