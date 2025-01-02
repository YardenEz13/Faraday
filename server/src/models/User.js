import { EntitySchema } from "typeorm";

// User entity
export const User = new EntitySchema({
  name: "User",
  columns: {
    id: {
      primary: true,
      type: "int",
      generated: true
    },
    username: {
      type: "varchar"
    },
    email: {
      type: "varchar"
    },
    password: {
      type: "varchar"
    },
    role: {
      type: "varchar"
    },
    mathLevel: {
      type: "float",
      default: 1.0
    },
    teacherId: {
      type: "int",
      nullable: true
    }
  },
  relations: {
    teacher: {
      type: "many-to-one",
      target: "User",
      joinColumn: {
        name: "teacherId"
      }
    },
    students: {
      type: "one-to-many",
      target: "User",
      inverseSide: "teacher"
    },
    assignments: {
      type: "one-to-many",
      target: "Assignment",
      inverseSide: "student"
    },
    createdAssignments: {
      type: "one-to-many",
      target: "Assignment",
      inverseSide: "teacher"
    }
  }
});