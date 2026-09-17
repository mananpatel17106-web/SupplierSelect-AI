import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";

import { getRequirementById } from "../models/requirement.model.js";

import {
  getQuotationById,
  getQuotationsByRequirement,
  getQuotationItems,
} from "../models/quotation.model.js";

import {
  createAnalysis,
  updateAnalysis,
  getAnalysisByQuotationId,
  getAnalysisByRequirementId,
} from "../models/analysis.model.js";

import { checkMandatoryRequirements } from "../services/validation.service.js";

import { calculateQuotationScore } from "../services/scoring.service.js";

import { rankSuppliers } from "../services/ranking.service.js";

import {
  generateSupplierExplanation,
  generateRecommendationExplanation,
} from "../services/explanation.service.js";

import {
  generateQuotationWarningsForItems,
  checkUnusuallyLowPrice,
} from "../services/warning.service.js";

// ============================================================
// RUN ANALYSIS
// ============================================================

const runAnalysis = asyncHandler(async (req, res) => {
  const requirementId = Number(req.params.requirementId);

  if (!Number.isInteger(requirementId) || requirementId <= 0) {
    throw new ApiError(400, "Invalid requirement ID");
  }

  // ========================================================
  // GET REQUIREMENT + OWNERSHIP CHECK
  // ========================================================

  const requirement = getRequirementById(requirementId, req.user.id);

  if (!requirement) {
    throw new ApiError(404, "Purchase requirement not found");
  }

  // ========================================================
  // GET QUOTATIONS
  // ========================================================

  const quotations = getQuotationsByRequirement(requirementId);

  if (!quotations.length) {
    throw new ApiError(400, "No quotations found for this requirement");
  }

  // ========================================================
  // GET ITEMS FOR EACH QUOTATION
  // ========================================================

  const quotationItemsMap = new Map();

  for (const quotation of quotations) {
    const items = getQuotationItems(quotation.id);

    quotationItemsMap.set(quotation.id, items);
  }

  // ========================================================
  // FIRST PASS
  //
  // Validate every supplier first.
  //
  // DO NOT calculate scores yet.
  //
  // Only eligible suppliers will participate
  // in the scoring stage.
  // ========================================================

  const supplierResults = [];

  for (const quotation of quotations) {
    const items = quotationItemsMap.get(quotation.id) || [];

    // ======================================================
    // NO QUOTATION ITEMS
    // ======================================================

    if (!items.length) {
      supplierResults.push({
        supplierId: quotation.id,

        supplierName: quotation.supplierName,

        items: [],

        eligibilityStatus: "ineligible",

        priceScore: 0,

        deliveryScore: 0,

        warrantyScore: 0,

        totalScore: 0,

        warnings: ["Quotation information is not available"],
      });

      continue;
    }

    // ======================================================
    // WARNINGS
    // ======================================================

    const quotationWarnings = generateQuotationWarningsForItems(items);

    // ======================================================
    // MULTI-ITEM VERIFICATION
    //
    // Current requirement model does not contain a
    // product identifier that allows us to safely decide
    // which quotation item should be compared.
    //
    // Therefore:
    // 1 item  -> normal analysis
    // 2+ items -> manual verification
    //
    // We never silently score only the first item.
    // ======================================================

    if (items.length > 1) {
      supplierResults.push({
        supplierId: quotation.id,

        supplierName: quotation.supplierName,

        items,

        eligibilityStatus: "needs_verification",

        priceScore: 0,

        deliveryScore: 0,

        warrantyScore: 0,

        totalScore: 0,

        warnings: [
          ...new Set([
            ...quotationWarnings,
            "Multiple quotation items were extracted. Manual verification is required before automatic scoring.",
          ]),
        ],
      });

      continue;
    }

    // ======================================================
    // MANDATORY REQUIREMENT CHECK
    // ======================================================

    const mandatoryCheck = checkMandatoryRequirements(requirement, {
      supplierName: quotation.supplierName,

      items,
    });

    // ======================================================
    // INELIGIBLE SUPPLIER
    // ======================================================

    if (!mandatoryCheck.eligible) {
      const mandatoryWarnings = mandatoryCheck.results.flatMap((itemResult) =>
        Object.values(itemResult.checks)
          .filter((check) => !check.passed)
          .map((check) => check.message),
      );

      const allWarnings = [...quotationWarnings, ...mandatoryWarnings];

      supplierResults.push({
        supplierId: quotation.id,

        supplierName: quotation.supplierName,

        items,

        eligibilityStatus: "ineligible",

        priceScore: 0,

        deliveryScore: 0,

        warrantyScore: 0,

        totalScore: 0,

        warnings: [...new Set(allWarnings)],
      });

      continue;
    }

    // ======================================================
    // ELIGIBLE SUPPLIER
    //
    // Only one quotation item is allowed to enter
    // automatic scoring.
    // ======================================================

    supplierResults.push({
      supplierId: quotation.id,

      supplierName: quotation.supplierName,

      items,

      eligibilityStatus: "eligible",

      priceScore: 0,

      deliveryScore: 0,

      warrantyScore: 0,

      totalScore: 0,

      warnings: [...new Set(quotationWarnings)],
    });
  }

  // ========================================================
  // SECOND PASS
  //
  // ONLY AUTOMATICALLY ELIGIBLE SUPPLIERS ARE USED
  // FOR SCORING.
  //
  // Suppliers requiring manual verification are excluded.
  // ========================================================

  const eligibleSupplierResults = supplierResults.filter(
    (supplier) => supplier.eligibilityStatus === "eligible",
  );

  // ========================================================
  // COLLECT ITEMS ONLY FROM ELIGIBLE SUPPLIERS
  // ========================================================

  const eligibleItems = eligibleSupplierResults.flatMap(
    (supplier) => supplier.items,
  );

  // ========================================================
  // COLLECT VALID PRICES ONLY FROM ELIGIBLE SUPPLIERS
  // ========================================================

  const eligiblePrices = eligibleItems
    .map((item) => item.unitPrice)
    .filter(
      (price) => price !== null && price !== undefined && Number(price) > 0,
    );

  // ========================================================
  // SCORE EACH ELIGIBLE SUPPLIER
  // ========================================================

  for (const supplier of eligibleSupplierResults) {
    // At this stage every supplier has exactly
    // one quotation item.

    const primaryItem = supplier.items[0];

    // ======================================================
    // LOW PRICE WARNING
    // ======================================================

    const lowPriceWarning = checkUnusuallyLowPrice(
      primaryItem.unitPrice,
      eligiblePrices,
    );

    if (lowPriceWarning) {
      supplier.warnings.push(lowPriceWarning);
    }

    // ======================================================
    // CALCULATE SCORE
    // ======================================================

    const score = calculateQuotationScore(
      primaryItem,
      eligibleItems,
      requirement,
    );

    supplier.priceScore = score.priceScore;

    supplier.deliveryScore = score.deliveryScore;

    supplier.warrantyScore = score.warrantyScore;

    supplier.totalScore = score.totalScore;

    supplier.warnings = [...new Set(supplier.warnings)];
  }

  // ========================================================
  // REMOVE INTERNAL ITEMS BEFORE RANKING
  // ========================================================

  const analyzedSuppliers = supplierResults.map((supplier) => {
    const { items, ...publicSupplier } = supplier;

    return publicSupplier;
  });

  // ========================================================
  // RANK ELIGIBLE SUPPLIERS
  // ========================================================

  const rankedSuppliers = rankSuppliers(analyzedSuppliers);

  // ========================================================
  // SAVE / UPDATE ANALYSIS
  // ========================================================

  for (const supplier of analyzedSuppliers) {
    const rankedSupplier = rankedSuppliers.find(
      (item) => item.supplierId === supplier.supplierId,
    );

    const rank = rankedSupplier?.rank ?? null;

    // ======================================================
    // EXPLANATION
    // ======================================================

    const explanation = generateSupplierExplanation(
      supplier,
      rankedSuppliers,
      requirement,
    );

    // ======================================================
    // MANDATORY STATUS
    // ======================================================

    let mandatoryStatus = "failed";

    if (supplier.eligibilityStatus === "eligible") {
      mandatoryStatus = "passed";
    } else if (supplier.eligibilityStatus === "needs_verification") {
      mandatoryStatus = "needs_verification";
    }

    const analysisData = {
      mandatoryStatus,

      eligibilityStatus: supplier.eligibilityStatus,

      priceScore: supplier.priceScore || 0,

      deliveryScore: supplier.deliveryScore || 0,

      warrantyScore: supplier.warrantyScore || 0,

      totalScore: supplier.totalScore || 0,

      rank,

      warnings: JSON.stringify(supplier.warnings || []),

      explanation,
    };

    // ======================================================
    // EXISTING ANALYSIS?
    // ======================================================

    const existingAnalysis = getAnalysisByQuotationId(supplier.supplierId);

    if (existingAnalysis) {
      updateAnalysis(supplier.supplierId, analysisData);
    } else {
      createAnalysis({
        quotationId: supplier.supplierId,

        ...analysisData,
      });
    }
  }

  // ========================================================
  // RECOMMENDATION
  // ========================================================

  const recommendation = generateRecommendationExplanation(
    rankedSuppliers,
    requirement,
  );

  // ========================================================
  // RESPONSE
  // ========================================================

  const suppliersWithRanks = analyzedSuppliers.map((supplier) => {
    const rankedSupplier = rankedSuppliers.find(
      (item) => item.supplierId === supplier.supplierId,
    );

    return {
      ...supplier,
      rank: rankedSupplier?.rank ?? null,
    };
  });

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        suppliers: suppliersWithRanks,

        recommendation,
      },
      "Quotation analysis completed successfully",
    ),
  );
});

// ============================================================
// GET ANALYSIS BY REQUIREMENT
// ============================================================

const getAnalysis = asyncHandler(async (req, res) => {
  const requirementId = Number(req.params.requirementId);

  if (!Number.isInteger(requirementId) || requirementId <= 0) {
    throw new ApiError(400, "Invalid requirement ID");
  }

  // ======================================================
  // OWNERSHIP CHECK
  // ======================================================

  const requirement = getRequirementById(requirementId, req.user.id);

  if (!requirement) {
    throw new ApiError(404, "Purchase requirement not found");
  }

  const analysis = getAnalysisByRequirementId(requirementId);

  return res
    .status(200)
    .json(new ApiResponse(200, analysis, "Analysis fetched successfully"));
});

// ============================================================
// GET SINGLE ANALYSIS BY QUOTATION
// ============================================================

const getSingleAnalysis = asyncHandler(async (req, res) => {
  const quotationId = Number(req.params.quotationId);

  if (!Number.isInteger(quotationId) || quotationId <= 0) {
    throw new ApiError(400, "Invalid quotation ID");
  }

  // ======================================================
  // GET QUOTATION
  // ======================================================

  const quotation = getQuotationById(quotationId);

  if (!quotation) {
    throw new ApiError(404, "Quotation not found");
  }

  // ======================================================
  // OWNERSHIP CHECK
  //
  // quotation
  //     ↓
  // requirement
  //     ↓
  // current user
  // ======================================================

  const requirement = getRequirementById(quotation.requirementId, req.user.id);

  if (!requirement) {
    // Do not reveal whether the quotation
    // belongs to another user.

    throw new ApiError(404, "Quotation not found");
  }

  // ======================================================
  // GET ANALYSIS
  // ======================================================

  const analysis = getAnalysisByQuotationId(quotationId);

  if (!analysis) {
    throw new ApiError(404, "Analysis not found");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, analysis, "Analysis fetched successfully"));
});

// ============================================================
// EXPORT
// ============================================================

export { runAnalysis, getAnalysis, getSingleAnalysis };
