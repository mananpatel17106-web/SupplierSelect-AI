import { Router } from "express";

import {
  runAnalysis,
  getAnalysis,
  getSingleAnalysis,
} from "../controllers/analysis.controller.js";

import { authMiddleware } from "../middlewares/auth.middleware.js";

const router = Router();

router.use(authMiddleware);

// Run complete quotation analysis
router.post(
  "/requirement/:requirementId/run",
  runAnalysis
);

// Get analysis for requirement
router.get(
  "/requirement/:requirementId",
  getAnalysis
);

// Get analysis for one quotation
router.get(
  "/quotation/:quotationId",
  getSingleAnalysis
);

export default router;