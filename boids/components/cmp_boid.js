export function BoidComponent() {
    return {
        maxSpeed: 140, // px per second
        minSpeed: 90,
        turnFactor: 20, // steering strength (see note below)
        visualRange: 40,
        protectedRange: 8,
        avoidFactor: 220,
        avoidRange: 100,
    };
}
