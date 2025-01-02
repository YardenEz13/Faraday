import { getRepository } from "typeorm";
import { User } from "../models/User.js";

export const createUser = async (userData) => {
  const userRepository = getRepository(User);
  
  const user = userRepository.create({
    ...userData,
    badges: [],
    progress: {},
    mathLevel: 1.0,
    points: 0,
    streak: 0
  });
  
  return await userRepository.save(user);
}; 