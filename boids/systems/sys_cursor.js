import { InputState } from "../components/tgs_cursor.js";
export class CursorSystem {
    update(entityManager) {
        const entities = entityManager.getEntities();
        entities.forEach((components) => {
            const cursor = components.get("Cursor");
            const position = components.get("Position");
            if (cursor && position) {
                position.x = InputState.mouseX;
                position.y = InputState.mouseY;
            }
        });
    }
}
