import { Router } from "express";

import {
  uploadQuotation,
  getOneQuotation,
  getAllQuotations,
  removeQuotation,
} from "../controllers/quotation.controller.js";

import { authMiddleware } from "../middlewares/auth.middleware.js";
import { upload } from "../middlewares/multer.middleware.js";

const router = Router();

// All quotation routes require authentication
router.use(authMiddleware);

// Upload quotation
router.post(
  "/upload",
  upload.single("quotation"),
  uploadQuotation
);

// Get all quotations for a requirement
router.get(
  "/requirement/:requirementId",
  getAllQuotations
);

// Get one quotation
router.get(
  "/:id",
  getOneQuotation
);

// Delete quotation
router.delete(
  "/:id",
  removeQuotation
);

export default router;