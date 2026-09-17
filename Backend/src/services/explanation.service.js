const generateSupplierExplanation = (supplier, allSuppliers, requirement) => {
  if (!supplier) {
    return "No supplier information is available.";
  }

  const supplierName = supplier.supplierName || "Supplier";

  // ================= INELIGIBLE SUPPLIER =================

  if (supplier.eligibilityStatus === "needs_verification") {
    return `${supplierName} requires manual verification because multiple quotation items were extracted.`;
  }

  if (supplier.eligibilityStatus !== "eligible") {
    return `${supplierName} was excluded because one or more mandatory requirements were not satisfied.`;
  }

  // ================= REASONS =================

  const reasons = [];

  reasons.push("All mandatory requirements were satisfied");

  // ================= COMPETITORS =================

  const competitors = Array.isArray(allSuppliers)
    ? allSuppliers.filter(
        (item) =>
          item.supplierId !== supplier.supplierId &&
          item.eligibilityStatus === "eligible",
      )
    : [];

  // ================= PRICE COMPARISON =================

  if (competitors.length) {
    const highestPriceScore = Math.max(
      supplier.priceScore || 0,
      ...competitors.map((item) => item.priceScore || 0),
    );

    if (supplier.priceScore === highestPriceScore) {
      reasons.push("offers the lowest quoted price among eligible suppliers");
    }
  }

  // ================= DELIVERY COMPARISON =================

  if (competitors.length) {
    const highestDeliveryScore = Math.max(
      supplier.deliveryScore || 0,
      ...competitors.map((item) => item.deliveryScore || 0),
    );

    if (supplier.deliveryScore === highestDeliveryScore) {
      reasons.push("has the fastest delivery among eligible suppliers");
    }
  }

  // ================= WARRANTY COMPARISON =================

  if (competitors.length) {
    const highestWarrantyScore = Math.max(
      supplier.warrantyScore || 0,
      ...competitors.map((item) => item.warrantyScore || 0),
    );

    if (supplier.warrantyScore === highestWarrantyScore) {
      reasons.push("provides the strongest warranty among eligible suppliers");
    }
  }

  // ================= BASIC EXPLANATION =================

  let explanation = `${supplierName} is eligible and received a total weighted score of ${supplier.totalScore}. `;

  if (reasons.length) {
    explanation += reasons.join(", ") + ". ";
  }

  // ================= LOWER-RANKED SUPPLIERS =================

  if (competitors.length) {
    const lowerRankedSuppliers = competitors.filter(
      (item) => item.totalScore < supplier.totalScore,
    );

    if (lowerRankedSuppliers.length) {
      const names = lowerRankedSuppliers
        .map((item) => `${item.supplierName} (${item.totalScore})`)
        .join(", ");

      explanation += `Its overall weighted score is higher than ${names}.`;
    }
  }

  // ================= WEIGHT EXPLANATION =================

  if (
    requirement &&
    requirement.priceWeight !== null &&
    requirement.priceWeight !== undefined &&
    requirement.deliveryWeight !== null &&
    requirement.deliveryWeight !== undefined &&
    requirement.warrantyWeight !== null &&
    requirement.warrantyWeight !== undefined
  ) {
    explanation += ` The final score uses the configured weights: price ${requirement.priceWeight}%, delivery ${requirement.deliveryWeight}%, and warranty ${requirement.warrantyWeight}%.`;
  }

  return explanation;
};

// ================= RECOMMENDATION EXPLANATION =================

const generateRecommendationExplanation = (rankedSuppliers, requirement) => {
  if (!Array.isArray(rankedSuppliers) || !rankedSuppliers.length) {
    return {
      hasRecommendation: false,

      explanation: "No eligible supplier is available for recommendation.",
    };
  }

  const bestSupplier = rankedSuppliers[0];

  const explanation = generateSupplierExplanation(
    bestSupplier,
    rankedSuppliers,
    requirement,
  );

  return {
    hasRecommendation: true,

    supplierId: bestSupplier.supplierId,

    supplierName: bestSupplier.supplierName,

    totalScore: bestSupplier.totalScore,

    rank: bestSupplier.rank,

    explanation,
  };
};

// ================= EXPORT =================

export { generateSupplierExplanation, generateRecommendationExplanation };
