import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";

import {
  createQuotation,
  getQuotationById,
  getQuotationsByRequirement,
  deleteQuotation,
} from "../models/quotation.model.js";

import {
  getRequirementById,
} from "../models/requirement.model.js";

import {
  uploadOnCloudinary,
} from "../utils/cloudinary.js";

import {
  processQuotation,
} from "../services/quotation-processing.service.js";


// ================= UPLOAD QUOTATION =================

const uploadQuotation = asyncHandler(
  async (req, res) => {

    const {
      requirementId,
      supplierName,
    } = req.body;


    // ================= VALIDATION =================

    if (!requirementId) {
      throw new ApiError(
        400,
        "Requirement ID is required"
      );
    }


    if (!supplierName) {
      throw new ApiError(
        400,
        "Supplier name is required"
      );
    }


    if (!req.file) {
      throw new ApiError(
        400,
        "Quotation file is required"
      );
    }


    // ================= CHECK REQUIREMENT =================

    const requirement =
      getRequirementById(
        Number(requirementId),
        req.user.id
      );


    if (!requirement) {
      throw new ApiError(
        404,
        "Purchase requirement not found"
      );
    }


    // ================= CLOUDINARY UPLOAD =================

    const cloudinaryResponse =
      await uploadOnCloudinary(
        req.file.path
      );


    if (!cloudinaryResponse) {
      throw new ApiError(
        500,
        "Failed to upload quotation file"
      );
    }


    // ================= FILE TYPE =================

    const fileType =
      req.file.mimetype ===
      "application/pdf"
        ? "pdf"
        : "image";


    // ================= CREATE QUOTATION =================

    const quotation =
      createQuotation({

        requirementId:
          Number(requirementId),

        supplierName:
          supplierName.trim(),

        fileName:
          req.file.originalname,

        fileUrl:
          cloudinaryResponse.secure_url,

        fileType,
      });


    // ================= PROCESS PDF =================

    let processing = null;


    if (fileType === "pdf") {

      try {

        processing =
          await processQuotation({
            quotationId:
              quotation.id,

            userId:
              req.user.id,
          });

      } catch (error) {

        console.error(
          "Quotation processing error:",
          error
        );


        processing = {
          status:
            "processing_failed",

          message:
            error.message,
        };
      }
    }


    // ================= RESPONSE =================

    return res
      .status(201)
      .json(
        new ApiResponse(
          201,
          {
            quotation,
            processing,
          },
          "Quotation uploaded successfully"
        )
      );
  }
);


// ================= GET SINGLE QUOTATION =================

const getOneQuotation =
  asyncHandler(
    async (req, res) => {

      const {
        id,
      } = req.params;


      const quotation =
        getQuotationById(
          Number(id)
        );


      if (!quotation) {
        throw new ApiError(
          404,
          "Quotation not found"
        );
      }


      // ================= OWNERSHIP CHECK =================

      const requirement =
        getRequirementById(
          quotation.requirementId,
          req.user.id
        );


      if (!requirement) {
        throw new ApiError(
          404,
          "Quotation not found"
        );
      }


      return res
        .status(200)
        .json(
          new ApiResponse(
            200,
            quotation,
            "Quotation fetched successfully"
          )
        );
    }
  );


// ================= GET ALL QUOTATIONS =================

const getAllQuotations =
  asyncHandler(
    async (req, res) => {

      const {
        requirementId,
      } = req.params;


      // ================= CHECK REQUIREMENT =================

      const requirement =
        getRequirementById(
          Number(requirementId),
          req.user.id
        );


      if (!requirement) {
        throw new ApiError(
          404,
          "Purchase requirement not found"
        );
      }


      // ================= GET QUOTATIONS =================

      const quotations =
        getQuotationsByRequirement(
          Number(requirementId)
        );


      return res
        .status(200)
        .json(
          new ApiResponse(
            200,
            quotations,
            "Quotations fetched successfully"
          )
        );
    }
  );


// ================= DELETE QUOTATION =================

const removeQuotation =
  asyncHandler(
    async (req, res) => {

      const {
        id,
      } = req.params;


      // ================= GET QUOTATION =================

      const quotation =
        getQuotationById(
          Number(id)
        );


      if (!quotation) {
        throw new ApiError(
          404,
          "Quotation not found"
        );
      }


      // ================= OWNERSHIP CHECK =================

      const requirement =
        getRequirementById(
          quotation.requirementId,
          req.user.id
        );


      if (!requirement) {
        throw new ApiError(
          404,
          "Quotation not found"
        );
      }


      // ================= DELETE =================

      const result =
        deleteQuotation(
          Number(id)
        );


      if (result.changes === 0) {
        throw new ApiError(
          500,
          "Failed to delete quotation"
        );
      }


      return res
        .status(200)
        .json(
          new ApiResponse(
            200,
            null,
            "Quotation deleted successfully"
          )
        );
    }
  );


// ================= EXPORT =================

export {
  uploadQuotation,
  getOneQuotation,
  getAllQuotations,
  removeQuotation,
};