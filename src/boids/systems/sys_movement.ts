import { EntityManager } from "../entities/entityManager.js";
import { PositionComponent } from "../components/cmp_position.js";
import { VelocityComponent } from "../components/cmp_velocity.js";

export class MovementSystem {
    update(entityManager: EntityManager, canvasWidth: number, canvasHeight: number,dt: number) {
        const entities = entityManager.getEntities();

        entities.forEach((components, entityId) => {
            const position = components.get('Position') as ReturnType<typeof PositionComponent>;
            const velocity = components.get('Velocity') as ReturnType<typeof VelocityComponent>;

            if (position && velocity) {
                position.x += velocity.x * dt;
                position.y += velocity.y * dt;

            }
            
        });
    }
}