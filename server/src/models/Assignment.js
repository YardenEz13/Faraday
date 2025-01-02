// server/src/models/Assignment.js
import { EntitySchema } from "typeorm";

export const Assignment = new EntitySchema({
  name: "Assignment",
  columns: {
    id: {
      primary: true,
      type: "int",
      generated: true
    },
    title: {
      type: "varchar",
      length: 255
    },
    description: {
      type: "text"
    },
    solution: {
      type: "varchar",
      length: 255
    },
    studentAnswer: {
      type: "varchar",
      length: 255,
      nullable: true
    },
    isCompleted: {
      type: "boolean",
      default: false
    },
    isSurrendered: {
      type: "boolean",
      default: false
    },
    dueDate: {
      type: "datetime",
      nullable: true
    },
    createdAt: {
      type: "datetime",
      default: () => "CURRENT_TIMESTAMP"
    },
    updatedAt: {
      type: "datetime",
      default: () => "CURRENT_TIMESTAMP",
      onUpdate: "CURRENT_TIMESTAMP"
    }
  },
  relations: {
    student: {
      type: "many-to-one",
      target: "User",
      inverseSide: "assignments"
    },
    teacher: {
      type: "many-to-one",
      target: "User",
      inverseSide: "createdAssignments"
    }
  }
});
