// server/src/models/StudentAnswer.js
import { EntitySchema } from "typeorm";

export const StudentAnswer = new EntitySchema({
  name: "StudentAnswer",
  tableName: "student_answers",
  columns: {
    id: {
      primary: true,
      type: "int",
      generated: true
    },
    answer: {
      type: "text"
    },
    isCorrect: {
      type: "boolean",
      default: false
    }
  },
  relations: {
    student: {
      target: "User",
      type: "many-to-one",
      joinColumn: {
        name: "studentId"
      }
    },
    assignment: {
      target: "Assignment",
      type: "many-to-one",
      joinColumn: {
        name: "assignmentId"
      }
    }
  }
});
