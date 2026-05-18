import { EntityManager } from "../entities/entityManager.js";
import { PositionComponent } from "../components/cmp_position.js";
import { CursorTag, InputState } from "../components/tgs_cursor.js";

export class CursorSystem {
  update(entityManager: EntityManager) {
    const entities = entityManager.getEntities();

    entities.forEach((components) => {
      const cursor = components.get("Cursor") as ReturnType<typeof CursorTag>;
      const position = components.get("Position") as ReturnType<typeof PositionComponent>;

      if (cursor && position) {
        position.x = InputState.mouseX;
        position.y = InputState.mouseY;
      }
    });
  }
}