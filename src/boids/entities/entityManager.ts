import { Component } from '../types';

export class EntityManager {
    private entities: Map<number, Map<string, Component>> = new Map();
    private nextEntityId: number = 0;

    createEntity(): number {
        const entityId = this.nextEntityId++;
        this.entities.set(entityId, new Map());
        return entityId;
    }

    addComponent(entityId: number, componentName: string, component: Component): void {
        const entity = this.entities.get(entityId);
        if (entity) {
            entity.set(componentName, component);
        }
    }

    getComponent(entityId: number, componentName: string): Component | undefined {
        const entity = this.entities.get(entityId);
        return entity ? entity.get(componentName) : undefined;
    }

    getEntities(): Map<number, Map<string, Component>> {
        return this.entities;
    }
}