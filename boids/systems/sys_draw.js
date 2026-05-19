export class DrawSystem {
    constructor(context) {
        this.context = context;
    }
    update(entityManager) {
        const entities = entityManager.getEntities();
        for (const [entityId, components] of entities) {
            const position = components.get('Position');
            if (!position)
                continue;
            const draw = components.get('Draw');
            if (!draw)
                continue;
            const velocity = components.get('Velocity');
            if (position && draw) {
                this.context.fillStyle = draw.color;
                if (draw.shape === 'circle') {
                    this.context.beginPath();
                    this.context.arc(position.x, position.y, draw.size, 0, Math.PI * 2);
                    this.context.fill();
                }
                else if (draw.shape === 'square') {
                    this.context.beginPath();
                    this.context.rect(position.x - draw.size / 2, position.y - draw.size / 2, draw.size, draw.size);
                    this.context.fill();
                }
                else if (draw.shape === 'triangle') {
                    let angle = 0;
                    if (velocity)
                        angle = Math.atan2(velocity.y, velocity.x);
                    this.context.save();
                    this.context.translate(position.x, position.y);
                    this.context.rotate(angle);
                    this.context.beginPath();
                    // forward = +X direction
                    const size = draw.size;
                    this.context.moveTo(size, 0); // nose (forward)
                    this.context.lineTo(-size, size * 0.6); // back bottom
                    this.context.lineTo(-size, -size * 0.6); // back top
                    this.context.closePath();
                    this.context.fill();
                    this.context.restore();
                }
            }
        }
        ;
    }
}
