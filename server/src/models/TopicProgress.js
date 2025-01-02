import { EntitySchema } from "typeorm";

export const TopicProgress = new EntitySchema({
  name: "TopicProgress",
  columns: {
    id: {
      primary: true,
      type: "int",
      generated: true
    },
    topic: {
      type: "varchar"
    },
    mastery: {
      type: "float",
      default: 0
    },
    lastPracticed: {
      type: "timestamp",
      default: () => "CURRENT_TIMESTAMP"
    },
    correctAnswers: {
      type: "int",
      default: 0
    },
    totalAttempts: {
      type: "int",
      default: 0
    }
  },
  relations: {
    user: {
      type: "many-to-one",
      target: "User",
      inverseSide: "topicProgress"
    }
  }
}); 