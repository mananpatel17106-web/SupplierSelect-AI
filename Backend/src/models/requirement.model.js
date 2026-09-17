import db from "../db/index.js";

// ================= CREATE REQUIREMENT =================

const createRequirement = ({
  userId,
  title,
  description,
  quantity,
  maxPrice,
  maxDeliveryDays,
  minWarrantyYears,
  paymentTerms,
  priceWeight,
  deliveryWeight,
  warrantyWeight,
}) => {
  const statement = db.prepare(`
    INSERT INTO purchase_requirements (
      user_id,
      title,
      description,
      quantity,
      max_price,
      max_delivery_days,
      min_warranty_years,
      payment_terms,
      price_weight,
      delivery_weight,
      warranty_weight
    )
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const result = statement.run(
    userId,
    title,
    description,
    quantity,
    maxPrice,
    maxDeliveryDays,
    minWarrantyYears,
    paymentTerms,
    priceWeight,
    deliveryWeight,
    warrantyWeight
  );

  return getRequirementById(
    Number(result.lastInsertRowid),
    userId
  );
};


// ================= GET ALL REQUIREMENTS =================

const getAllRequirements = (userId) => {
  return db
    .prepare(`
      SELECT
        id,
        user_id AS userId,
        title,
        description,
        quantity,
        max_price AS maxPrice,
        max_delivery_days AS maxDeliveryDays,
        min_warranty_years AS minWarrantyYears,
        payment_terms AS paymentTerms,
        price_weight AS priceWeight,
        delivery_weight AS deliveryWeight,
        warranty_weight AS warrantyWeight,
        created_at AS createdAt,
        updated_at AS updatedAt
      FROM purchase_requirements
      WHERE user_id = ?
      ORDER BY created_at DESC
    `)
    .all(userId);
};


// ================= GET REQUIREMENT BY ID =================

const getRequirementById = (
  id,
  userId
) => {
  return db
    .prepare(`
      SELECT
        id,
        user_id AS userId,
        title,
        description,
        quantity,
        max_price AS maxPrice,
        max_delivery_days AS maxDeliveryDays,
        min_warranty_years AS minWarrantyYears,
        payment_terms AS paymentTerms,
        price_weight AS priceWeight,
        delivery_weight AS deliveryWeight,
        warranty_weight AS warrantyWeight,
        created_at AS createdAt,
        updated_at AS updatedAt
      FROM purchase_requirements
      WHERE id = ?
        AND user_id = ?
    `)
    .get(id, userId);
};


// ================= UPDATE REQUIREMENT =================

const updateRequirement = (
  id,
  userId,
  {
    title,
    description,
    quantity,
    maxPrice,
    maxDeliveryDays,
    minWarrantyYears,
    paymentTerms,
    priceWeight,
    deliveryWeight,
    warrantyWeight,
  }
) => {
  const statement = db.prepare(`
    UPDATE purchase_requirements
    SET
      title = ?,
      description = ?,
      quantity = ?,
      max_price = ?,
      max_delivery_days = ?,
      min_warranty_years = ?,
      payment_terms = ?,
      price_weight = ?,
      delivery_weight = ?,
      warranty_weight = ?,
      updated_at = CURRENT_TIMESTAMP
    WHERE id = ?
      AND user_id = ?
  `);

  const result = statement.run(
    title,
    description,
    quantity,
    maxPrice,
    maxDeliveryDays,
    minWarrantyYears,
    paymentTerms,
    priceWeight,
    deliveryWeight,
    warrantyWeight,
    id,
    userId
  );

  if (result.changes === 0) {
    return null;
  }

  return getRequirementById(
    id,
    userId
  );
};


// ================= DELETE REQUIREMENT =================

const deleteRequirement = (
  id,
  userId
) => {
  return db
    .prepare(`
      DELETE FROM purchase_requirements
      WHERE id = ?
        AND user_id = ?
    `)
    .run(id, userId);
};


// ================= EXPORT =================

export {
  createRequirement,
  getAllRequirements,
  getRequirementById,
  updateRequirement,
  deleteRequirement,
};