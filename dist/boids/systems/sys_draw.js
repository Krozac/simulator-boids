export class DrawSystem {
    constructor(context) {
        this.context = context;
    }
    update(entityManager) {
        const entities = entityManager.getEntities();
        this.context.clearRect(0, 0, this.context.canvas.width, this.context.canvas.height);
        entities.forEach((components, entityId) => {
            const position = components.get('Position');
            const draw = components.get('Draw');
            const velocity = components.get('Velocity');
            if (position && draw) {
                this.context.fillStyle = draw.color;
                this.context.beginPath();
                if (draw.shape === 'circle') {
                    this.context.arc(position.x, position.y, draw.size, 0, Math.PI * 2);
                }
                else if (draw.shape === 'square') {
                    this.context.rect(position.x - draw.size / 2, position.y - draw.size / 2, draw.size, draw.size);
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
                this.context.fill();
            }
        });
    }
}
