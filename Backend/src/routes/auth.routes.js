import { Router } from "express";

import {
  register,
  login,
  logout,
  changePasswordController,
  getMe,
} from "../controllers/auth.controller.js";

import { authMiddleware } from "../middlewares/auth.middleware.js";

const router = Router();

router.post(
  "/register",
  register
);

router.post(
  "/login",
  login
);

router.post(
  "/logout",
  logout
);

router.patch(
  "/change-password",
  authMiddleware,
  changePasswordController
);

router.get(
  "/me",
  authMiddleware,
  getMe
);

export default router;