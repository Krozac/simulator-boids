export class EntityManager {
    constructor() {
        this.entities = new Map();
        this.nextEntityId = 0;
    }
    createEntity() {
        const entityId = this.nextEntityId++;
        this.entities.set(entityId, new Map());
        return entityId;
    }
    addComponent(entityId, componentName, component) {
        const entity = this.entities.get(entityId);
        if (entity) {
            entity.set(componentName, component);
        }
    }
    getComponent(entityId, componentName) {
        const entity = this.entities.get(entityId);
        return entity ? entity.get(componentName) : undefined;
    }
    getEntities() {
        return this.entities;
    }
}
