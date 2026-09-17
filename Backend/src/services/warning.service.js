const generateQuotationWarnings = (
  item
) => {

  const warnings = [];


  // ================= PRODUCT NAME =================

  if (
    item.productName === null ||
    item.productName === undefined ||
    item.productName === ""
  ) {

    warnings.push(
      "Product name is not specified"
    );
  }


  // ================= QUANTITY =================

  if (
    item.quantity === null ||
    item.quantity === undefined
  ) {

    warnings.push(
      "Quantity is not specified"
    );
  }


  // ================= UNIT PRICE =================

  if (
    item.unitPrice === null ||
    item.unitPrice === undefined
  ) {

    warnings.push(
      "Unit price is not specified"
    );
  }


  // ================= TOTAL PRICE =================

  if (
    item.totalPrice === null ||
    item.totalPrice === undefined
  ) {

    warnings.push(
      "Total price is not specified"
    );
  }


  // ================= DELIVERY =================

  if (
    item.deliveryDays === null ||
    item.deliveryDays === undefined
  ) {

    warnings.push(
      "Delivery time is not specified"
    );
  }


  // ================= WARRANTY =================

  if (
    item.warrantyYears === null ||
    item.warrantyYears === undefined
  ) {

    warnings.push(
      "Warranty information is not specified"
    );
  }


  // ================= PAYMENT TERMS =================

  if (
    item.paymentTerms === null ||
    item.paymentTerms === undefined ||
    item.paymentTerms === ""
  ) {

    warnings.push(
      "Payment terms are not specified"
    );
  }


  return warnings;
};


// ================= WARNINGS FOR ALL ITEMS =================

const generateQuotationWarningsForItems = (
  items
) => {

  if (!Array.isArray(items)) {
    return [];
  }


  const warnings = [];


  items.forEach(
    (item, index) => {

      const itemWarnings =
        generateQuotationWarnings(
          item
        );


      itemWarnings.forEach(
        (warning) => {

          warnings.push(
            `Item ${index + 1}: ${warning}`
          );
        }
      );
    }
  );


  return warnings;
};


// ================= UNUSUALLY LOW PRICE =================

const checkUnusuallyLowPrice = (
  quotedPrice,
  allPrices
) => {

  const price =
    Number(quotedPrice);


  // Invalid price

  if (
    !Number.isFinite(price) ||
    price <= 0
  ) {

    return null;
  }


  if (
    !Array.isArray(allPrices)
  ) {

    return null;
  }


  const validPrices =
    allPrices
      .map(
        (value) =>
          Number(value)
      )
      .filter(
        (value) =>
          Number.isFinite(value) &&
          value > 0
      );


  // Need at least two supplier prices
  // to compare prices.

  if (
    validPrices.length < 2
  ) {

    return null;
  }


  // ================= AVERAGE PRICE =================

  const averagePrice =
    validPrices.reduce(
      (sum, value) =>
        sum + value,
      0
    ) / validPrices.length;


  // ================= LOW PRICE THRESHOLD =================

  const lowPriceThreshold =
    averagePrice * 0.7;


  if (
    price < lowPriceThreshold
  ) {

    return `Quoted price (${price}) is unusually low compared with the average supplier price (${Number(
      averagePrice.toFixed(2)
    )}). Manual verification is recommended.`;
  }


  return null;
};


// ================= EXPORT =================

export {
  generateQuotationWarnings,
  generateQuotationWarningsForItems,
  checkUnusuallyLowPrice,
};