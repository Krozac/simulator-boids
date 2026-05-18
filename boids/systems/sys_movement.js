export class MovementSystem {
    update(entityManager, canvasWidth, canvasHeight, dt) {
        const entities = entityManager.getEntities();
        entities.forEach((components, entityId) => {
            const position = components.get('Position');
            const velocity = components.get('Velocity');
            if (position && velocity) {
                position.x += velocity.x * dt;
                position.y += velocity.y * dt;
            }
        });
    }
}
