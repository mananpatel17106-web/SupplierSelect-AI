const rankSuppliers = (
  suppliers
) => {

  if (!Array.isArray(suppliers)) {
    return [];
  }


  // ================= FILTER ELIGIBLE SUPPLIERS =================

  const eligibleSuppliers =
    suppliers.filter(
      (supplier) =>
        supplier.eligibilityStatus ===
        "eligible"
    );


  // ================= SORT BY TOTAL SCORE =================

  const sortedSuppliers =
    [...eligibleSuppliers].sort(
      (a, b) =>
        Number(b.totalScore || 0) -
        Number(a.totalScore || 0)
    );


  // ================= ASSIGN RANK =================

  return sortedSuppliers.map(
    (supplier, index) => ({
      ...supplier,
      rank: index + 1,
    })
  );
};


// ================= GET BEST SUPPLIER =================

const getBestSupplier = (
  rankedSuppliers
) => {

  if (
    !Array.isArray(rankedSuppliers) ||
    rankedSuppliers.length === 0
  ) {

    return null;
  }


  return rankedSuppliers[0];
};


// ================= CREATE RANKING SUMMARY =================

const createRankingSummary = (
  rankedSuppliers
) => {

  const bestSupplier =
    getBestSupplier(
      rankedSuppliers
    );


  // ================= NO RECOMMENDATION =================

  if (!bestSupplier) {

    return {

      hasRecommendation:
        false,

      recommendation:
        null,

      message:
        "No eligible supplier found. No recommendation can be made.",
    };
  }


  // ================= RECOMMENDATION =================

  return {

    hasRecommendation:
      true,

    recommendation: {

      supplierId:
        bestSupplier.supplierId,

      supplierName:
        bestSupplier.supplierName,

      totalScore:
        bestSupplier.totalScore,

      rank:
        bestSupplier.rank,
    },

    message:
      "Best eligible supplier identified based on weighted score.",
  };
};


// ================= EXPORT =================

export {
  rankSuppliers,
  getBestSupplier,
  createRankingSummary,
};