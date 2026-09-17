const getValidNumber = (value) => {
  const number = Number(value);

  if (!Number.isFinite(number)) {
    return null;
  }

  return number;
};


// ================= PRICE SCORE =================

const calculatePriceScore = (
  quotedPrice,
  allPrices
) => {

  const price =
    getValidNumber(quotedPrice);

  if (
    price === null ||
    price <= 0
  ) {
    return 0;
  }


  const validPrices =
    allPrices
      .map(getValidNumber)
      .filter(
        (value) =>
          value !== null &&
          value > 0
      );


  if (!validPrices.length) {
    return 0;
  }


  const lowestPrice =
    Math.min(...validPrices);


  if (lowestPrice <= 0) {
    return 0;
  }


  const score =
    (lowestPrice / price) * 100;


  return Number(
    Math.min(score, 100).toFixed(2)
  );
};


// ================= DELIVERY SCORE =================

const calculateDeliveryScore = (
  quotedDeliveryDays,
  allDeliveryDays
) => {

  const deliveryDays =
    getValidNumber(
      quotedDeliveryDays
    );


  if (
    deliveryDays === null ||
    deliveryDays <= 0
  ) {
    return 0;
  }


  const validDeliveryDays =
    allDeliveryDays
      .map(getValidNumber)
      .filter(
        (value) =>
          value !== null &&
          value > 0
      );


  if (!validDeliveryDays.length) {
    return 0;
  }


  const fastestDelivery =
    Math.min(
      ...validDeliveryDays
    );


  if (fastestDelivery <= 0) {
    return 0;
  }


  const score =
    (fastestDelivery / deliveryDays) *
    100;


  return Number(
    Math.min(score, 100).toFixed(2)
  );
};


// ================= WARRANTY SCORE =================

const calculateWarrantyScore = (
  quotedWarrantyYears,
  allWarrantyYears
) => {

  const warrantyYears =
    getValidNumber(
      quotedWarrantyYears
    );


  if (
    warrantyYears === null ||
    warrantyYears < 0
  ) {
    return 0;
  }


  const validWarrantyYears =
    allWarrantyYears
      .map(getValidNumber)
      .filter(
        (value) =>
          value !== null &&
          value >= 0
      );


  if (!validWarrantyYears.length) {
    return 0;
  }


  const highestWarranty =
    Math.max(
      ...validWarrantyYears
    );


  if (highestWarranty <= 0) {

    // If every supplier has 0-year warranty,
    // there is no difference between them.

    return 100;
  }


  const score =
    (warrantyYears / highestWarranty) *
    100;


  return Number(
    Math.min(score, 100).toFixed(2)
  );
};


// ================= TOTAL WEIGHTED SCORE =================

const calculateTotalScore = (
  priceScore,
  deliveryScore,
  warrantyScore,
  requirement
) => {

  const priceWeight =
    getValidNumber(
      requirement.priceWeight
    ) ?? 0;

  const deliveryWeight =
    getValidNumber(
      requirement.deliveryWeight
    ) ?? 0;

  const warrantyWeight =
    getValidNumber(
      requirement.warrantyWeight
    ) ?? 0;


  const totalScore =
    (
      priceScore * priceWeight +
      deliveryScore * deliveryWeight +
      warrantyScore * warrantyWeight
    ) / 100;


  return Number(
    Math.max(
      0,
      Math.min(
        totalScore,
        100
      )
    ).toFixed(2)
  );
};


// ================= COMPLETE QUOTATION SCORE =================

const calculateQuotationScore = (
  item,
  allItems,
  requirement
) => {

  if (!item) {

    return {
      priceScore: 0,
      deliveryScore: 0,
      warrantyScore: 0,
      totalScore: 0,
    };
  }


  // ================= ALL PRICES =================

  const allPrices =
    allItems
      .map(
        (quotationItem) =>
          quotationItem.unitPrice
      );


  // ================= ALL DELIVERY DAYS =================

  const allDeliveryDays =
    allItems
      .map(
        (quotationItem) =>
          quotationItem.deliveryDays
      );


  // ================= ALL WARRANTY YEARS =================

  const allWarrantyYears =
    allItems
      .map(
        (quotationItem) =>
          quotationItem.warrantyYears
      );


  // ================= INDIVIDUAL SCORES =================

  const priceScore =
    calculatePriceScore(
      item.unitPrice,
      allPrices
    );


  const deliveryScore =
    calculateDeliveryScore(
      item.deliveryDays,
      allDeliveryDays
    );


  const warrantyScore =
    calculateWarrantyScore(
      item.warrantyYears,
      allWarrantyYears
    );


  // ================= FINAL SCORE =================

  const totalScore =
    calculateTotalScore(
      priceScore,
      deliveryScore,
      warrantyScore,
      requirement
    );


  return {
    priceScore,
    deliveryScore,
    warrantyScore,
    totalScore,
  };
};


// ================= EXPORT =================

export {
  calculatePriceScore,
  calculateDeliveryScore,
  calculateWarrantyScore,
  calculateTotalScore,
  calculateQuotationScore,
};