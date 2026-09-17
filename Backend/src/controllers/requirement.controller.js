import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";

import {
  createRequirement,
  getAllRequirements,
  getRequirementById,
  updateRequirement,
  deleteRequirement,
} from "../models/requirement.model.js";


// ================= CREATE =================

const create = asyncHandler(async (req, res) => {
  const {
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
  } = req.body;


  // ================= REQUIRED FIELD =================

  if (!title || !title.trim()) {
    throw new ApiError(
      400,
      "Title is required"
    );
  }


  // ================= PARSE NUMBERS =================

  const parsedQuantity =
    quantity !== undefined &&
    quantity !== null &&
    quantity !== ""
      ? Number(quantity)
      : null;


  const parsedMaxPrice =
    maxPrice !== undefined &&
    maxPrice !== null &&
    maxPrice !== ""
      ? Number(maxPrice)
      : null;


  const parsedMaxDeliveryDays =
    maxDeliveryDays !== undefined &&
    maxDeliveryDays !== null &&
    maxDeliveryDays !== ""
      ? Number(maxDeliveryDays)
      : null;


  const parsedMinWarrantyYears =
    minWarrantyYears !== undefined &&
    minWarrantyYears !== null &&
    minWarrantyYears !== ""
      ? Number(minWarrantyYears)
      : null;


  const parsedPriceWeight =
    priceWeight !== undefined &&
    priceWeight !== null &&
    priceWeight !== ""
      ? Number(priceWeight)
      : 0;


  const parsedDeliveryWeight =
    deliveryWeight !== undefined &&
    deliveryWeight !== null &&
    deliveryWeight !== ""
      ? Number(deliveryWeight)
      : 0;


  const parsedWarrantyWeight =
    warrantyWeight !== undefined &&
    warrantyWeight !== null &&
    warrantyWeight !== ""
      ? Number(warrantyWeight)
      : 0;


  // ================= NUMERIC VALIDATION =================

  const numericValues = [
    parsedQuantity,
    parsedMaxPrice,
    parsedMaxDeliveryDays,
    parsedMinWarrantyYears,
    parsedPriceWeight,
    parsedDeliveryWeight,
    parsedWarrantyWeight,
  ];


  if (
    numericValues.some(
      (value) =>
        value !== null &&
        !Number.isFinite(value)
    )
  ) {
    throw new ApiError(
      400,
      "Invalid numeric value"
    );
  }


  // ================= WEIGHT VALIDATION =================

  const totalWeight =
    parsedPriceWeight +
    parsedDeliveryWeight +
    parsedWarrantyWeight;


  if (
    Math.abs(totalWeight - 100) >
    0.001
  ) {
    throw new ApiError(
      400,
      "Price, delivery and warranty weights must total 100"
    );
  }


  // ================= VALUE VALIDATION =================

  if (
    parsedQuantity !== null &&
    parsedQuantity <= 0
  ) {
    throw new ApiError(
      400,
      "Quantity must be greater than 0"
    );
  }


  if (
    parsedMaxPrice !== null &&
    parsedMaxPrice < 0
  ) {
    throw new ApiError(
      400,
      "Max price cannot be negative"
    );
  }


  if (
    parsedMaxDeliveryDays !== null &&
    parsedMaxDeliveryDays < 0
  ) {
    throw new ApiError(
      400,
      "Max delivery days cannot be negative"
    );
  }


  if (
    parsedMinWarrantyYears !== null &&
    parsedMinWarrantyYears < 0
  ) {
    throw new ApiError(
      400,
      "Minimum warranty cannot be negative"
    );
  }


  // ================= CREATE REQUIREMENT =================

  const requirement =
    createRequirement({

      userId:
        req.user.id,

      title:
        title.trim(),

      description:
        description?.trim() ||
        null,

      quantity:
        parsedQuantity,

      maxPrice:
        parsedMaxPrice,

      maxDeliveryDays:
        parsedMaxDeliveryDays,

      minWarrantyYears:
        parsedMinWarrantyYears,

      paymentTerms:
        paymentTerms?.trim() ||
        null,

      priceWeight:
        parsedPriceWeight,

      deliveryWeight:
        parsedDeliveryWeight,

      warrantyWeight:
        parsedWarrantyWeight,
    });


  return res
    .status(201)
    .json(
      new ApiResponse(
        201,
        requirement,
        "Purchase requirement created successfully"
      )
    );
});


// ================= GET ALL =================

const getAll =
  asyncHandler(
    async (req, res) => {

      const requirements =
        getAllRequirements(
          req.user.id
        );


      return res
        .status(200)
        .json(
          new ApiResponse(
            200,
            requirements,
            "Purchase requirements fetched successfully"
          )
        );
    }
  );


// ================= GET ONE =================

const getOne =
  asyncHandler(
    async (req, res) => {

      const { id } =
        req.params;


      const requirement =
        getRequirementById(
          Number(id),
          req.user.id
        );


      if (!requirement) {
        throw new ApiError(
          404,
          "Purchase requirement not found"
        );
      }


      return res
        .status(200)
        .json(
          new ApiResponse(
            200,
            requirement,
            "Purchase requirement fetched successfully"
          )
        );
    }
  );


// ================= UPDATE =================

const update =
  asyncHandler(
    async (req, res) => {

      const { id } =
        req.params;


      const requirementId =
        Number(id);


      if (
        !Number.isInteger(
          requirementId
        ) ||
        requirementId <= 0
      ) {
        throw new ApiError(
          400,
          "Invalid requirement ID"
        );
      }


      // ================= FIND EXISTING =================

      const existingRequirement =
        getRequirementById(
          requirementId,
          req.user.id
        );


      if (!existingRequirement) {
        throw new ApiError(
          404,
          "Purchase requirement not found"
        );
      }


      const {
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
      } = req.body;


      // ================= BUILD UPDATED DATA =================

      const updatedData = {

        title:
          title !== undefined
            ? title.trim()
            : existingRequirement.title,


        description:
          description !== undefined
            ? description.trim() || null
            : existingRequirement.description,


        quantity:
          quantity !== undefined
            ? (
                quantity === null ||
                quantity === ""
                  ? null
                  : Number(quantity)
              )
            : existingRequirement.quantity,


        maxPrice:
          maxPrice !== undefined
            ? (
                maxPrice === null ||
                maxPrice === ""
                  ? null
                  : Number(maxPrice)
              )
            : existingRequirement.maxPrice,


        maxDeliveryDays:
          maxDeliveryDays !== undefined
            ? (
                maxDeliveryDays === null ||
                maxDeliveryDays === ""
                  ? null
                  : Number(maxDeliveryDays)
              )
            : existingRequirement.maxDeliveryDays,


        minWarrantyYears:
          minWarrantyYears !== undefined
            ? (
                minWarrantyYears === null ||
                minWarrantyYears === ""
                  ? null
                  : Number(minWarrantyYears)
              )
            : existingRequirement.minWarrantyYears,


        paymentTerms:
          paymentTerms !== undefined
            ? paymentTerms?.trim() || null
            : existingRequirement.paymentTerms,


        priceWeight:
          priceWeight !== undefined
            ? Number(priceWeight)
            : existingRequirement.priceWeight,


        deliveryWeight:
          deliveryWeight !== undefined
            ? Number(deliveryWeight)
            : existingRequirement.deliveryWeight,


        warrantyWeight:
          warrantyWeight !== undefined
            ? Number(warrantyWeight)
            : existingRequirement.warrantyWeight,
      };


      // ================= TITLE VALIDATION =================

      if (
        !updatedData.title
      ) {
        throw new ApiError(
          400,
          "Title is required"
        );
      }


      // ================= NUMERIC VALIDATION =================

      const numericValues = [
        updatedData.quantity,
        updatedData.maxPrice,
        updatedData.maxDeliveryDays,
        updatedData.minWarrantyYears,
        updatedData.priceWeight,
        updatedData.deliveryWeight,
        updatedData.warrantyWeight,
      ];


      if (
        numericValues.some(
          (value) =>
            value !== null &&
            !Number.isFinite(value)
        )
      ) {
        throw new ApiError(
          400,
          "Invalid numeric value"
        );
      }


      // ================= WEIGHT VALIDATION =================

      const totalWeight =
        updatedData.priceWeight +
        updatedData.deliveryWeight +
        updatedData.warrantyWeight;


      if (
        Math.abs(totalWeight - 100) >
        0.001
      ) {
        throw new ApiError(
          400,
          "Price, delivery and warranty weights must total 100"
        );
      }


      // ================= VALUE VALIDATION =================

      if (
        updatedData.quantity !== null &&
        updatedData.quantity <= 0
      ) {
        throw new ApiError(
          400,
          "Quantity must be greater than 0"
        );
      }


      if (
        updatedData.maxPrice !== null &&
        updatedData.maxPrice < 0
      ) {
        throw new ApiError(
          400,
          "Max price cannot be negative"
        );
      }


      if (
        updatedData.maxDeliveryDays !== null &&
        updatedData.maxDeliveryDays < 0
      ) {
        throw new ApiError(
          400,
          "Max delivery days cannot be negative"
        );
      }


      if (
        updatedData.minWarrantyYears !== null &&
        updatedData.minWarrantyYears < 0
      ) {
        throw new ApiError(
          400,
          "Minimum warranty cannot be negative"
        );
      }


      // ================= UPDATE =================

      const requirement =
        updateRequirement(
          requirementId,
          req.user.id,
          updatedData
        );


      if (!requirement) {
        throw new ApiError(
          500,
          "Failed to update purchase requirement"
        );
      }


      return res
        .status(200)
        .json(
          new ApiResponse(
            200,
            requirement,
            "Purchase requirement updated successfully"
          )
        );
    }
  );


// ================= DELETE =================

const remove =
  asyncHandler(
    async (req, res) => {

      const { id } =
        req.params;


      const requirementId =
        Number(id);


      const existingRequirement =
        getRequirementById(
          requirementId,
          req.user.id
        );


      if (!existingRequirement) {
        throw new ApiError(
          404,
          "Purchase requirement not found"
        );
      }


      const result =
        deleteRequirement(
          requirementId,
          req.user.id
        );


      if (
        result.changes === 0
      ) {
        throw new ApiError(
          500,
          "Failed to delete purchase requirement"
        );
      }


      return res
        .status(200)
        .json(
          new ApiResponse(
            200,
            null,
            "Purchase requirement deleted successfully"
          )
        );
    }
  );


// ================= EXPORT =================

export {
  create,
  getAll,
  getOne,
  update,
  remove,
};