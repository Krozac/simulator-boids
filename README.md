# Simulator Boids

A browser-based Boids simulation using an ECS (Entity Component System) architecture.

Inspired by Craig Reynolds' flocking algorithm, this project simulates emergent collective behavior through simple local interaction rules.

## Features

- Real-time boids simulation
- Separation / Alignment / Cohesion behaviors
- Obstacle avoidance
- Spatial grid optimization
- ECS architecture
- Interactive runtime options

---

# Behaviors

Each boid follows three main rules:

## Separation
Avoid nearby boids to prevent collisions.

## Alignment
Align movement direction with neighboring boids.

## Cohesion
Move toward nearby flock members.

These simple rules generate complex emergent flocking behavior.

---

# ECS Structure

## Entities

### `BoidEntity`
Main simulation agent.

Components:
- BoidComponent
- PositionComponent
- VelocityComponent
- AccelerationComponent
- DrawComponent

### `ObstacleEntity`
Obstacle object used for avoidance behavior.

Components:
- ObstacleComponent
- PositionComponent
- DrawComponent

---

## Systems

### `BoidSystem`
Handles steering and flocking behavior.

### `MovementSystem`
Updates positions using velocity.

### `DrawSystem`
Renders entities on screen.

---

## Components

- `BoidComponent`
- `PositionComponent`
- `VelocityComponent`
- `AccelerationComponent`
- `DrawComponent`
- `ObstacleComponent`

---

# Runtime Options

| Option | Description |
|---|---|
| Boid count | Number of simulated boids |
| Use spatial grid | Improves neighbor search performance |
| Attach obstacle to cursor | Interactive obstacle control |
| Show FPS | Displays rendering performance |

---

# Why ECS?

Using ECS allows:
- better scalability,
- cleaner separation of logic,
- easier experimentation,
- improved performance opportunities.

---

# Demo

Live version:
https://theoguenezan.fr/simulator-boids/

---

# License

MIT
