export function DrawComponent(color: string = 'black', size: number = 5, shape: 'circle' | 'square' | 'triangle' = 'circle') {
    return {
        color,
        size,
        shape,
    };
}