import { Router } from "express";

import {
  create,
  getAll,
  getOne,
  update,
  remove,
} from "../controllers/requirement.controller.js";

import { authMiddleware } from "../middlewares/auth.middleware.js";

const router = Router();

// All requirement routes require login
router.use(authMiddleware);

// Create requirement
router.post("/", create);

// Get all requirements
router.get("/", getAll);

// Get single requirement
router.get("/:id", getOne);

// Update requirement
router.patch("/:id", update);

// Delete requirement
router.delete("/:id", remove);

export default router;