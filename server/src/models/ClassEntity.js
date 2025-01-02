// server/src/models/ClassEntity.js
import { EntitySchema } from "typeorm";

export const ClassEntity = new EntitySchema({
  name: "ClassEntity",
  tableName: "classes",
  columns: {
    id: {
      primary: true,
      type: "int",
      generated: true
    },
    className: {
      type: "varchar"
    }
  },
  relations: {
    teacher: {
      target: "User",
      type: "many-to-one",
      joinColumn: {
        name: "teacherId"
      }
    }
  }
});
