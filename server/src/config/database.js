// server/src/config/database.js
import { DataSource } from "typeorm";
import { User } from "../models/User.js";
import { Assignment } from "../models/Assignment.js";
import dotenv from "dotenv";

dotenv.config();

export const AppDataSource = new DataSource({
  type: "mysql",
  host: process.env.DATABASE_HOST,
  port: parseInt(process.env.DATABASE_PORT),
  username: process.env.DATABASE_USER,
  password: process.env.DATABASE_PASSWORD,
  database: process.env.DATABASE_NAME,
  synchronize: true,
  logging: true,
  entities: [User, Assignment],
  migrations: [],
  subscribers: [],
  timezone: "Z", // UTC timezone
  charset: "utf8mb4",
  supportBigNumbers: true,
  bigNumberStrings: true,
  dateStrings: true
});

export const createConnection = async () => {
  return AppDataSource.initialize();
};
