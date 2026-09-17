import db from "../db/index.js";

// ================= CREATE QUOTATION =================

const createQuotation = ({
  requirementId,
  supplierName,
  fileName,
  fileUrl,
  fileType,
}) => {
  const statement = db.prepare(`
    INSERT INTO quotations (
      requirement_id,
      supplier_name,
      file_name,
      file_url,
      file_type,
      status
    )
    VALUES (?, ?, ?, ?, ?, ?)
  `);

  const result = statement.run(
    requirementId,
    supplierName,
    fileName,
    fileUrl,
    fileType,
    "processing"
  );

  return getQuotationById(
    Number(result.lastInsertRowid)
  );
};


// ================= GET QUOTATION BY ID =================

const getQuotationById = (id) => {
  return db
    .prepare(`
      SELECT
        id,
        requirement_id AS requirementId,
        supplier_name AS supplierName,
        file_name AS fileName,
        file_url AS fileUrl,
        file_type AS fileType,
        status,
        created_at AS createdAt
      FROM quotations
      WHERE id = ?
    `)
    .get(id);
};


// ================= GET QUOTATIONS BY REQUIREMENT =================

const getQuotationsByRequirement = (
  requirementId
) => {
  return db
    .prepare(`
      SELECT
        id,
        requirement_id AS requirementId,
        supplier_name AS supplierName,
        file_name AS fileName,
        file_url AS fileUrl,
        file_type AS fileType,
        status,
        created_at AS createdAt
      FROM quotations
      WHERE requirement_id = ?
      ORDER BY created_at DESC
    `)
    .all(requirementId);
};


// ================= UPDATE QUOTATION STATUS =================

const updateQuotationStatus = (
  id,
  status
) => {
  return db
    .prepare(`
      UPDATE quotations
      SET status = ?
      WHERE id = ?
    `)
    .run(
      status,
      id
    );
};


// ================= CREATE SINGLE QUOTATION ITEM =================

const createQuotationItem = ({
  quotationId,
  productName,
  quantity,
  unitPrice,
  totalPrice,
  deliveryDays,
  warrantyYears,
  paymentTerms,
}) => {

  const statement = db.prepare(`
    INSERT INTO quotation_items (
      quotation_id,
      product_name,
      quantity,
      unit_price,
      total_price,
      delivery_days,
      warranty_years,
      payment_terms
    )
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const result = statement.run(
    quotationId,
    productName,
    quantity,
    unitPrice,
    totalPrice,
    deliveryDays,
    warrantyYears,
    paymentTerms
  );

  return getQuotationItemById(
    Number(result.lastInsertRowid)
  );
};


// ================= GET SINGLE QUOTATION ITEM =================

const getQuotationItemById = (
  id
) => {

  return db
    .prepare(`
      SELECT
        id,
        quotation_id AS quotationId,
        product_name AS productName,
        quantity,
        unit_price AS unitPrice,
        total_price AS totalPrice,
        delivery_days AS deliveryDays,
        warranty_years AS warrantyYears,
        payment_terms AS paymentTerms,
        created_at AS createdAt
      FROM quotation_items
      WHERE id = ?
    `)
    .get(id);
};


// ================= CREATE MULTIPLE QUOTATION ITEMS =================

const createQuotationItems = (
  quotationId,
  items
) => {

  const insert = db.prepare(`
    INSERT INTO quotation_items (
      quotation_id,
      product_name,
      quantity,
      unit_price,
      total_price,
      delivery_days,
      warranty_years,
      payment_terms
    )
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `);


  const insertMany =
    db.transaction((items) => {

      for (const item of items) {

        insert.run(
          quotationId,

          item.productName,

          item.quantity,

          item.unitPrice,

          item.totalPrice,

          item.deliveryDays,

          item.warrantyYears,

          item.paymentTerms
        );
      }
    });


  insertMany(items);

  return getQuotationItems(
    quotationId
  );
};


// ================= GET QUOTATION ITEMS =================

const getQuotationItems = (
  quotationId
) => {

  return db
    .prepare(`
      SELECT
        id,
        quotation_id AS quotationId,
        product_name AS productName,
        quantity,
        unit_price AS unitPrice,
        total_price AS totalPrice,
        delivery_days AS deliveryDays,
        warranty_years AS warrantyYears,
        payment_terms AS paymentTerms,
        created_at AS createdAt
      FROM quotation_items
      WHERE quotation_id = ?
      ORDER BY id ASC
    `)
    .all(quotationId);
};


// ================= DELETE QUOTATION =================

const deleteQuotation = (
  id
) => {

  return db
    .prepare(`
      DELETE FROM quotations
      WHERE id = ?
    `)
    .run(id);
};


// ================= EXPORT =================

export {
  createQuotation,
  getQuotationById,
  getQuotationsByRequirement,
  updateQuotationStatus,
  createQuotationItem,
  createQuotationItems,
  getQuotationItems,
  deleteQuotation,
};