import { ObstacleComponent } from "../components/cpm_obstacle.js";
import { PositionComponent } from "../components/cmp_position.js";
import { DrawComponent } from "../components/cmp_draw.js";
import { EntityManager } from "./entityManager.js";

export class ObstacleEntity {
    entityId: number;

    constructor(entityManager: EntityManager, x: number, y: number, r: number) {
        this.entityId = entityManager.createEntity();
        entityManager.addComponent(this.entityId, 'Obstacle', ObstacleComponent(r));
        entityManager.addComponent(this.entityId, 'Position', PositionComponent(x, y));
        entityManager.addComponent(this.entityId, 'Draw', DrawComponent('white', 5, 'circle'));
    }
}