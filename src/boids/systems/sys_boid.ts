import { EntityManager } from "../entities/entityManager.js";

import { BoidComponent } from "../components/cmp_boid.js";
import { PositionComponent } from "../components/cmp_position.js";
import { VelocityComponent } from "../components/cmp_velocity.js";
import { AccelerationComponent } from "../components/cmp_acceleration.js";

import { SpatialGrid } from "../../helpers/hel_grid.js";

export class BoidSystem {
    private entityManager: EntityManager;
    private useSpatialGrid : Boolean = false;
    private grid : SpatialGrid | null = null;
    private boidParams: {
        separationFactor: number,
        alignmentFactor: number,
        centeringFactor: number,
    };
    public canvasWidth: number;
    public canvasHeight: number;

    constructor(entityManager: EntityManager, useSpatialGrid: Boolean) {

        this.entityManager = entityManager;
        this.useSpatialGrid = useSpatialGrid

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

    update(dt :number) {
        const entities = this.entityManager.getEntities();

        console.log(this.useSpatialGrid);

        if (this.useSpatialGrid && this.grid){
            this.grid.clear();

            entities.forEach((components, entityId)=> {
                const pos = components.get('Position');
                if (pos) {
                    this.grid!.insert(entityId, pos.x, pos.y);
                }
            })
        }


        entities.forEach((components, entityId) => {
            const boid = components.get('Boid') as ReturnType<typeof BoidComponent>;
            const position = components.get('Position') as ReturnType<typeof PositionComponent>;
            const velocity = components.get('Velocity') as ReturnType<typeof VelocityComponent>;
            const acceleration = components.get('Acceleration') as ReturnType<typeof AccelerationComponent>;

            if (boid && position && velocity && acceleration) {
                this.applyupdate(entityId, position, velocity, boid, acceleration, dt);
                this.applySeparation(entityId, position, velocity, boid, dt);
                this.applyAlignment(entityId, position, velocity, boid, dt);
                this.applyCentering(entityId, position, velocity, boid, dt);
                this.applyObstacleAvoidance(entityId, position, velocity, boid, dt);
            }
        });
    }

    private applyupdate(entityId: number, position: ReturnType<typeof PositionComponent>, velocity: ReturnType<typeof VelocityComponent>, boid: ReturnType<typeof BoidComponent>, acceleration: ReturnType<typeof AccelerationComponent>,dt : number) {
        //console.log(velocity)

        velocity.x += acceleration.x * dt;
        velocity.y += acceleration.y * dt;

  
        const speed = Math.sqrt(velocity.x ** 2 + velocity.y ** 2);
        if (speed > boid.maxSpeed) {
            velocity.x = (velocity.x / speed) * boid.maxSpeed;
            velocity.y = (velocity.y / speed) * boid.maxSpeed;
        } else if (speed < boid.minSpeed && speed !== 0) {
            velocity.x = (velocity.x / speed) * boid.minSpeed;
            velocity.y = (velocity.y / speed) * boid.minSpeed;
        } else if (speed === 0) {
            velocity.x = boid.minSpeed;
            velocity.y = boid.minSpeed;
        }

        if (position.x < this.canvasWidth) velocity.x += boid.turnFactor;
        if (position.x > 0) velocity.x -=  boid.turnFactor;
        if (position.y < this.canvasHeight) velocity.y +=  boid.turnFactor;
        if (position.y > 0) velocity.y -=  boid.turnFactor;

        acceleration.x = 0;
        acceleration.y = 0;

    }

    private applySeparation(entityId: number, position: ReturnType<typeof PositionComponent>, velocity: ReturnType<typeof VelocityComponent>, boid: ReturnType<typeof BoidComponent>, dt : number) {
        const neighborIds = this.getNeighborIds(entityId, position);

        let close = { dx: 0, dy: 0 };
        neighborIds.forEach((otherEntityId) => {
            if (entityId === otherEntityId) return;

            const otherComponents = this.entityManager.getEntities().get(otherEntityId);

            if (!otherComponents) return;

            const otherPosition = otherComponents.get('Position') as ReturnType<typeof PositionComponent>;
            const otherBoid = otherComponents.get('Boid') as ReturnType<typeof BoidComponent>;

            if (otherPosition && otherBoid) {
                const distance = Math.sqrt((position.x - otherPosition.x) ** 2 + (position.y - otherPosition.y) ** 2);
                if (distance < boid.protectedRange && distance > 0) {
                    close.dx += position.x - otherPosition.x;
                    close.dy += position.y - otherPosition.y;
                }
            }
            
        });
        velocity.x += close.dx * this.boidParams.separationFactor * dt;
        velocity.y += close.dy * this.boidParams.separationFactor * dt;
    }

    private applyAlignment(entityId: number, position: ReturnType<typeof PositionComponent>, velocity: ReturnType<typeof VelocityComponent>, boid: ReturnType<typeof BoidComponent>, dt : number) {
            let xvel_avg = 0;
            let yvel_avg = 0;
            let neighboring_boids = 0;

            const neighborIds = this.getNeighborIds(entityId, position);

            neighborIds.forEach((otherEntityId) => {
                if (entityId === otherEntityId) return;

                const otherComponents = this.entityManager.getEntities().get(otherEntityId);

                if (!otherComponents) return;

                const otherPosition = otherComponents.get('Position') as ReturnType<typeof PositionComponent>;
                const otherBoid = otherComponents.get('Boid') as ReturnType<typeof BoidComponent>;
                const otherVelocity = otherComponents.get('Velocity') as ReturnType<typeof VelocityComponent>;

                if (otherPosition && otherBoid && otherVelocity) {
                    const distance = Math.sqrt((position.x - otherPosition.x) ** 2 + (position.y - otherPosition.y) ** 2);
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

    private applyCentering(entityId: number, position: ReturnType<typeof PositionComponent>, velocity: ReturnType<typeof VelocityComponent>, boid: ReturnType<typeof BoidComponent>, dt : number) {
        let xpos_avg = 0;
        let ypos_avg = 0;
        let neighboring_boids = 0;
        
        
        const neighborIds = this.getNeighborIds(entityId, position);

        neighborIds.forEach((otherEntityId) => {
                if (entityId === otherEntityId) return;

                const otherComponents = this.entityManager.getEntities().get(otherEntityId);

                if (!otherComponents) return;

                const otherPosition = otherComponents.get('Position') as ReturnType<typeof PositionComponent>;
                const otherBoid = otherComponents.get('Boid') as ReturnType<typeof BoidComponent>;

                if (otherPosition && otherBoid) {
                    const distance = Math.sqrt((position.x - otherPosition.x) ** 2 + (position.y - otherPosition.y) ** 2);
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

    private applyObstacleAvoidance(entityId: number, position: ReturnType<typeof PositionComponent>, velocity: ReturnType<typeof VelocityComponent>, boid: ReturnType<typeof BoidComponent>, dt : number) {
        const entities = this.entityManager.getEntities();

        let avoid = { dx: 0, dy: 0 };

        entities.forEach((components, otherId) => {
            const obstacle = components.get("Obstacle");
            const otherPos = components.get("Position") as ReturnType<typeof PositionComponent>;

            if (!obstacle || !otherPos) return;

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

    private getNeighborIds(entityId: number, position: ReturnType<typeof PositionComponent>) {
        if (this.useSpatialGrid && this.grid) {
            return this.grid.getNearby(position.x, position.y);
        }

        // fallback = all entities
        return Array.from(this.entityManager.getEntities().keys());
    }
}