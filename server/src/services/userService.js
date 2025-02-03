import User from "../models/User.js";

export const createUser = async (userData) => {
  const user = new User({
    ...userData,
    badges: [],
    progress: {},
    mathLevel: 1.0,
    points: 0,
    streak: 0
  });
  
  return await user.save();
}; 