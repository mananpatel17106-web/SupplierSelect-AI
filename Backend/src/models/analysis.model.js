import db from "../db/index.js";


// =====================================================
// CREATE OR UPDATE ANALYSIS
// =====================================================

const createAnalysis = ({
  quotationId,
  mandatoryStatus,
  eligibilityStatus,
  priceScore,
  deliveryScore,
  warrantyScore,
  totalScore,
  rank,
  warnings,
  explanation,
}) => {

  const statement = db.prepare(`
    INSERT INTO quotation_analysis (
      quotation_id,
      mandatory_status,
      eligibility_status,
      price_score,
      delivery_score,
      warranty_score,
      total_score,
      rank,
      warnings,
      explanation
    )
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)

    ON CONFLICT(quotation_id)
    DO UPDATE SET
      mandatory_status = excluded.mandatory_status,
      eligibility_status = excluded.eligibility_status,
      price_score = excluded.price_score,
      delivery_score = excluded.delivery_score,
      warranty_score = excluded.warranty_score,
      total_score = excluded.total_score,
      rank = excluded.rank,
      warnings = excluded.warnings,
      explanation = excluded.explanation,
      updated_at = CURRENT_TIMESTAMP
  `);


  statement.run(
    quotationId,
    mandatoryStatus,
    eligibilityStatus,
    priceScore,
    deliveryScore,
    warrantyScore,
    totalScore,
    rank,
    warnings,
    explanation
  );


  return getAnalysisByQuotationId(
    quotationId
  );
};


// =====================================================
// UPDATE ANALYSIS
// =====================================================

const updateAnalysis = (
  quotationId,
  {
    mandatoryStatus,
    eligibilityStatus,
    priceScore,
    deliveryScore,
    warrantyScore,
    totalScore,
    rank,
    warnings,
    explanation,
  }
) => {

  const statement = db.prepare(`
    UPDATE quotation_analysis
    SET
      mandatory_status = ?,
      eligibility_status = ?,
      price_score = ?,
      delivery_score = ?,
      warranty_score = ?,
      total_score = ?,
      rank = ?,
      warnings = ?,
      explanation = ?,
      updated_at = CURRENT_TIMESTAMP
    WHERE quotation_id = ?
  `);


  return statement.run(
    mandatoryStatus,
    eligibilityStatus,
    priceScore,
    deliveryScore,
    warrantyScore,
    totalScore,
    rank,
    warnings,
    explanation,
    quotationId
  );
};


// =====================================================
// GET ANALYSIS BY ID
// =====================================================

const getAnalysisById = (
  id
) => {

  return db
    .prepare(`
      SELECT
        id,
        quotation_id AS quotationId,

        mandatory_status AS mandatoryStatus,
        eligibility_status AS eligibilityStatus,

        price_score AS priceScore,
        delivery_score AS deliveryScore,
        warranty_score AS warrantyScore,
        total_score AS totalScore,

        rank,

        warnings,
        explanation,

        created_at AS createdAt,
        updated_at AS updatedAt

      FROM quotation_analysis

      WHERE id = ?
    `)
    .get(id);
};


// =====================================================
// GET ANALYSIS BY QUOTATION ID
// =====================================================

const getAnalysisByQuotationId = (
  quotationId
) => {

  return db
    .prepare(`
      SELECT
        id,
        quotation_id AS quotationId,

        mandatory_status AS mandatoryStatus,
        eligibility_status AS eligibilityStatus,

        price_score AS priceScore,
        delivery_score AS deliveryScore,
        warranty_score AS warrantyScore,
        total_score AS totalScore,

        rank,

        warnings,
        explanation,

        created_at AS createdAt,
        updated_at AS updatedAt

      FROM quotation_analysis

      WHERE quotation_id = ?

      LIMIT 1
    `)
    .get(quotationId);
};


// =====================================================
// GET ANALYSIS BY REQUIREMENT ID
// =====================================================

const getAnalysisByRequirementId = (
  requirementId
) => {

  return db
    .prepare(`
      SELECT
        qa.id,
        qa.quotation_id AS quotationId,

        qa.mandatory_status AS mandatoryStatus,
        qa.eligibility_status AS eligibilityStatus,

        qa.price_score AS priceScore,
        qa.delivery_score AS deliveryScore,
        qa.warranty_score AS warrantyScore,
        qa.total_score AS totalScore,

        qa.rank,

        qa.warnings,
        qa.explanation,

        qa.created_at AS createdAt,
        qa.updated_at AS updatedAt,

        q.supplier_name AS supplierName,
        q.file_name AS fileName,
        q.file_url AS fileUrl,
        q.file_type AS fileType

      FROM quotation_analysis qa

      JOIN quotations q
        ON qa.quotation_id = q.id

      WHERE q.requirement_id = ?

      ORDER BY
        CASE
          WHEN qa.rank IS NULL THEN 999999
          ELSE qa.rank
        END ASC,

        qa.id DESC
    `)
    .all(requirementId);
};


export {
  createAnalysis,
  updateAnalysis,
  getAnalysisById,
  getAnalysisByQuotationId,
  getAnalysisByRequirementId,
};