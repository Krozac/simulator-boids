export class SpatialGrid {
    constructor(cellSize) {
        this.grid = new Map();
        this.cellSize = cellSize;
    }
    clear() {
        this.grid.clear();
    }
    key(x, y) {
        const cx = Math.floor(x / this.cellSize);
        const cy = Math.floor(y / this.cellSize);
        return `${cx},${cy}`;
    }
    insert(entityId, x, y) {
        const k = this.key(x, y);
        if (!this.grid.has(k))
            this.grid.set(k, []);
        this.grid.get(k).push(entityId);
    }
    getNearby(x, y) {
        const cx = Math.floor(x / this.cellSize);
        const cy = Math.floor(y / this.cellSize);
        const neighbors = [];
        for (let dx = -1; dx <= 1; dx++) {
            for (let dy = -1; dy <= 1; dy++) {
                const key = `${cx + dx},${cy + dy}`;
                const cell = this.grid.get(key);
                if (cell)
                    neighbors.push(...cell);
            }
        }
        return neighbors;
    }
}
