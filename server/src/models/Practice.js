import { EntitySchema } from "typeorm";


export const Practice = new EntitySchema({
  name: "Practice",
  columns: {
    id: {
      primary: true,
      type: "int",
      generated: true
    },
    topic: {
      type: "varchar"
    },
    difficulty: {
      type: "float"
    },
    question: {
      type: "varchar"
    },
    answer: {
      type: "varchar"
    },
    userAnswer: {
      type: "varchar",
      nullable: true
    },
    isCorrect: {
      type: "boolean",
      default: false
    },
    timestamp: {
      type: "timestamp",
      default: () => "CURRENT_TIMESTAMP"
    },
    hintsUsed: {
      type: "int",
      default: 0
    }
  },
  relations: {
    user: {
      type: "many-to-one",
      target: "User",
      inverseSide: "practices"
    }
  }
}); 