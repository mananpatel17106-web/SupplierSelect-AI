import { ApiError } from "../utils/ApiError.js";


// ================= NORMALIZE NUMBER =================

const normalizeNumber = (value) => {

  if (
    value === null ||
    value === undefined ||
    value === ""
  ) {
    return null;
  }


  const number = Number(value);


  if (!Number.isFinite(number)) {
    return null;
  }


  return number;
};


// ================= NORMALIZE TEXT =================

const normalizeText = (value) => {

  if (
    value === null ||
    value === undefined
  ) {
    return null;
  }


  const text =
    String(value).trim();


  return text === ""
    ? null
    : text;
};


// ================= NORMALIZE QUOTATION ITEM =================

const normalizeQuotationItem = (
  item
) => {

  if (!item || typeof item !== "object") {
    return {
      productName: null,
      quantity: null,
      unitPrice: null,
      totalPrice: null,
      deliveryDays: null,
      warrantyYears: null,
      paymentTerms: null,
    };
  }


  return {

    productName:
      normalizeText(
        item.productName
      ),

    quantity:
      normalizeNumber(
        item.quantity
      ),

    unitPrice:
      normalizeNumber(
        item.unitPrice
      ),

    totalPrice:
      normalizeNumber(
        item.totalPrice
      ),

    deliveryDays:
      normalizeNumber(
        item.deliveryDays
      ),

    warrantyYears:
      normalizeNumber(
        item.warrantyYears
      ),

    paymentTerms:
      normalizeText(
        item.paymentTerms
      ),
  };
};


// ================= NORMALIZE QUOTATION =================

const normalizeQuotationData = (
  data
) => {

  if (
    !data ||
    typeof data !== "object"
  ) {
    throw new ApiError(
      422,
      "Invalid quotation data"
    );
  }


  const items =
    Array.isArray(data.items)
      ? data.items.map(
          normalizeQuotationItem
        )
      : [];


  return {

    supplierName:
      normalizeText(
        data.supplierName
      ),

    items,
  };
};


// ================= MANDATORY REQUIREMENT CHECK =================

const checkMandatoryRequirements = (
  requirement,
  quotationData
) => {

  const normalizedData =
    normalizeQuotationData(
      quotationData
    );


  const results = [];


  for (
    const item of normalizedData.items
  ) {

    const checks = {};


    // ================= QUANTITY =================

    if (
      requirement.quantity !== null &&
      requirement.quantity !== undefined
    ) {

      if (item.quantity === null) {

        checks.quantity = {
          passed: false,
          message:
            "Quantity is not specified in the quotation.",
        };

      } else {

        checks.quantity = {
          passed:
            item.quantity ===
            Number(requirement.quantity),

          message:
            item.quantity ===
            Number(requirement.quantity)
              ? "Quantity requirement satisfied."
              : `Quoted quantity (${item.quantity}) does not match required quantity (${requirement.quantity}).`,
        };
      }
    }


    // ================= MAX PRICE =================

    if (
      requirement.maxPrice !== null &&
      requirement.maxPrice !== undefined
    ) {

      if (item.unitPrice === null) {

        checks.maxPrice = {
          passed: false,
          message:
            "Unit price is not specified in the quotation.",
        };

      } else {

        checks.maxPrice = {
          passed:
            item.unitPrice <=
            Number(requirement.maxPrice),

          message:
            item.unitPrice <=
            Number(requirement.maxPrice)
              ? "Price requirement satisfied."
              : `Quoted unit price (${item.unitPrice}) exceeds maximum allowed price (${requirement.maxPrice}).`,
        };
      }
    }


    // ================= MAX DELIVERY =================

    if (
      requirement.maxDeliveryDays !== null &&
      requirement.maxDeliveryDays !== undefined
    ) {

      if (
        item.deliveryDays === null
      ) {

        checks.maxDeliveryDays = {
          passed: false,
          message:
            "Delivery time is not specified in the quotation.",
        };

      } else {

        checks.maxDeliveryDays = {
          passed:
            item.deliveryDays <=
            Number(
              requirement.maxDeliveryDays
            ),

          message:
            item.deliveryDays <=
            Number(
              requirement.maxDeliveryDays
            )
              ? "Delivery requirement satisfied."
              : `Quoted delivery time (${item.deliveryDays} days) exceeds maximum allowed delivery time (${requirement.maxDeliveryDays} days).`,
        };
      }
    }


    // ================= MIN WARRANTY =================

    if (
      requirement.minWarrantyYears !== null &&
      requirement.minWarrantyYears !== undefined
    ) {

      if (
        item.warrantyYears === null
      ) {

        checks.minWarrantyYears = {
          passed: false,
          message:
            "Warranty information is not specified in the quotation.",
        };

      } else {

        checks.minWarrantyYears = {
          passed:
            item.warrantyYears >=
            Number(
              requirement.minWarrantyYears
            ),

          message:
            item.warrantyYears >=
            Number(
              requirement.minWarrantyYears
            )
              ? "Warranty requirement satisfied."
              : `Quoted warranty (${item.warrantyYears} years) is below minimum required warranty (${requirement.minWarrantyYears} years).`,
        };
      }
    }


    // ================= ITEM ELIGIBILITY =================

    const itemEligible =
      Object.values(checks)
        .every(
          (check) =>
            check.passed
        );


    results.push({

      productName:
        item.productName,

      eligible:
        itemEligible,

      checks,

    });
  }


  // ================= NO ITEMS =================

  if (!normalizedData.items.length) {

    return {
      eligible: false,

      results: [],

      errors: [
        "No quotation items were extracted.",
      ],
    };
  }


  // ================= OVERALL ELIGIBILITY =================

  const eligible =
    results.every(
      (result) =>
        result.eligible
    );


  return {
    eligible,
    results,
    errors: eligible
      ? []
      : [
          "One or more mandatory requirements were not satisfied.",
        ],
  };
};


// ================= PROCESS QUOTATION DATA =================

const processQuotationData = (
  data
) => {

  const normalizedData =
    normalizeQuotationData(
      data
    );


  const errors = [];


  // ================= SUPPLIER NAME =================

  if (!normalizedData.supplierName) {

    errors.push(
      "Supplier name is not specified."
    );
  }


  // ================= ITEMS =================

  if (
    !normalizedData.items.length
  ) {

    errors.push(
      "No quotation items were extracted."
    );
  }


  return {

    valid:
      errors.length === 0,

    data:
      normalizedData,

    errors,
  };
};


// ================= EXPORT =================

export {
  normalizeNumber,
  normalizeText,
  normalizeQuotationItem,
  normalizeQuotationData,
  checkMandatoryRequirements,
  processQuotationData,
};