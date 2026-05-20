import { EntityManager } from "../entities/entityManager.js";
import { PositionComponent } from "../components/cmp_position.js";
import { DrawComponent } from "../components/cmp_draw.js";

export class DrawSystem {
    private context: CanvasRenderingContext2D;

    constructor(context: CanvasRenderingContext2D) {
        this.context = context;
    }

    update(entityManager: EntityManager) {
        const entities = entityManager.getEntities();

        for (const [entityId, components] of entities) {
            const position = components.get('Position') as ReturnType<typeof PositionComponent>;
            if (!position) continue;
            const draw = components.get('Draw') as ReturnType<typeof DrawComponent>;
            if (!draw) continue;
            const velocity = components.get('Velocity') as ReturnType<typeof PositionComponent>;

            if (position && draw) {
                this.context.fillStyle = draw.color;

                if (draw.shape === 'circle') {
                    this.context.beginPath();
                    this.context.arc(position.x, position.y, draw.size, 0, Math.PI * 2);
                    this.context.fill();
                } else if (draw.shape === 'square') {
                    this.context.beginPath();
                    this.context.rect(position.x - draw.size / 2, position.y - draw.size / 2, draw.size, draw.size);
                    this.context.fill();
                } else if (draw.shape === 'triangle') {
                    let angle = 0;
                    if (velocity) angle = Math.atan2(velocity.y, velocity.x);

                    const size = draw.size;

                    const cos = Math.cos(angle);
                    const sin = Math.sin(angle);

                    const x1 = position.x + cos * size;
                    const y1 = position.y + sin * size;

                    const x2 = position.x + cos * (-size) - sin * (size * 0.6);
                    const y2 = position.y + sin * (-size) + cos * (size * 0.6);

                    const x3 = position.x + cos * (-size) - sin * (-size * 0.6);
                    const y3 = position.y + sin * (-size) + cos * (-size * 0.6);

                    this.context.beginPath();
                    this.context.moveTo(x1, y1);
                    this.context.lineTo(x2, y2);
                    this.context.lineTo(x3, y3);
                    this.context.closePath();
                    this.context.fill();
                }
 
            }
        };
    }
}