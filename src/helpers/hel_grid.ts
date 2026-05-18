
export class SpatialGrid{
    private cellSize: number;
    private grid: Map<String,number[]> = new Map();

    constructor(cellSize: number){
        this.cellSize = cellSize;
    }

    clear() {
        this.grid.clear();
    }

    private key(x : number, y: number){
        const cx = Math.floor(x / this.cellSize);
        const cy = Math.floor(y / this.cellSize);
        return `${cx},${cy}`;
    }

    insert(entityId : number, x : number, y : number){
        const k = this.key(x,y);
        if (!this.grid.has(k)) this.grid.set(k,[]);
        this.grid.get(k)!.push(entityId)
    }

    getNearby (x:number, y:number):number[]{
        const cx = Math.floor(x / this.cellSize);
        const cy = Math.floor(y / this.cellSize);

        const neighbors: number[] = [];

        for (let dx = -1; dx <=1; dx++){
            for(let dy = -1; dy<=1; dy++){
                const key = `${cx + dx},${cy + dy}`;
                const cell = this.grid.get(key);
                if(cell) neighbors.push(...cell);
            }
        }

        return neighbors;
    }
}