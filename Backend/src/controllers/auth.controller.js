import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";

import {
  registerUser,
  loginUser,
  changePassword,
} from "../services/auth.service.js";

// Cookie configuration for local development
const cookieOptions = {
  httpOnly: true,
  secure: false,
  sameSite: "lax",
};

// ================= REGISTER =================

const register = asyncHandler(async (req, res) => {
  const { name, email, password, confirmPassword } = req.body;

  // Check required fields
  if (!name || !email || !password || !confirmPassword) {
    throw new ApiError(400, "All fields are required");
  }

  // Check password confirmation
  if (password !== confirmPassword) {
    throw new ApiError(400, "Passwords do not match");
  }

  // Check password length
  if (password.length < 6) {
    throw new ApiError(400, "Password must be at least 6 characters");
  }

  const user = await registerUser(
    name.trim(),
    email.toLowerCase().trim(),
    password
  );

  return res
    .status(201)
    .json(
      new ApiResponse(201, user, "User registered successfully")
    );
});

// ================= LOGIN =================

const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  // Check required fields
  if (!email || !password) {
    throw new ApiError(400, "Email and password are required");
  }

  const { user, token } = await loginUser(
    email.toLowerCase().trim(),
    password
  );

  return res
    .status(200)
    .cookie("accessToken", token, cookieOptions)
    .json(
      new ApiResponse(
        200,
        { user },
        "Login successful"
      )
    );
});

// ================= LOGOUT =================

const logout = asyncHandler(async (req, res) => {
  return res
    .status(200)
    .clearCookie("accessToken", cookieOptions)
    .json(
      new ApiResponse(
        200,
        null,
        "Logout successful"
      )
    );
});

// ================= CHANGE PASSWORD =================

const changePasswordController = asyncHandler(async (req, res) => {
  const {
    currentPassword,
    newPassword,
    confirmPassword,
  } = req.body;

  // Check required fields
  if (!currentPassword || !newPassword || !confirmPassword) {
    throw new ApiError(
      400,
      "All password fields are required"
    );
  }

  // Check new password confirmation
  if (newPassword !== confirmPassword) {
    throw new ApiError(
      400,
      "Passwords do not match"
    );
  }

  // Check new password length
  if (newPassword.length < 6) {
    throw new ApiError(
      400,
      "New password must be at least 6 characters"
    );
  }

  await changePassword(
    req.user.id,
    currentPassword,
    newPassword
  );

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        null,
        "Password changed successfully"
      )
    );
});

// ================= GET CURRENT USER =================

const getMe = asyncHandler(async (req, res) => {
  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        req.user,
        "User fetched successfully"
      )
    );
});

export {
  register,
  login,
  logout,
  changePasswordController,
  getMe,
};