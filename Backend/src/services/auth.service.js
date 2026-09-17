import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

import {
  createUser,
  getUserByEmail,
  getUserById,
  getUserWithPasswordById,
  updatePassword,
} from "../models/user.model.js";

const generateAccessToken = (user) => {
  return jwt.sign(
    {
      id: user.id,
      email: user.email,
      role: user.role,
    },
    process.env.ACCESS_TOKEN_SECRET,
    {
      expiresIn:
        process.env.ACCESS_TOKEN_EXPIRY || "1d",
    }
  );
};

const registerUser = async (
  name,
  email,
  password
) => {
  const existingUser = getUserByEmail(email);

  if (existingUser) {
    throw new Error("Email already registered");
  }

  const hashedPassword = await bcrypt.hash(
    password,
    10
  );

  return createUser(
    name,
    email,
    hashedPassword
  );
};

const loginUser = async (
  email,
  password
) => {
  const user = getUserByEmail(email);

  if (!user) {
    throw new Error("Invalid email or password");
  }

  const userWithPassword =
    getUserWithPasswordById(user.id);

  const passwordMatch =
    await bcrypt.compare(
      password,
      userWithPassword.password
    );

  if (!passwordMatch) {
    throw new Error(
      "Invalid email or password"
    );
  }

  const token = generateAccessToken(user);

  return {
    user,
    token,
  };
};

const changePassword = async (
  userId,
  currentPassword,
  newPassword
) => {
  const user =
    getUserWithPasswordById(userId);

  if (!user) {
    throw new Error("User not found");
  }

  const passwordMatch =
    await bcrypt.compare(
      currentPassword,
      user.password
    );

  if (!passwordMatch) {
    throw new Error(
      "Current password is incorrect"
    );
  }

  const hashedPassword =
    await bcrypt.hash(newPassword, 10);

  updatePassword(
    userId,
    hashedPassword
  );
};

export {
  registerUser,
  loginUser,
  changePassword,
  generateAccessToken,
};