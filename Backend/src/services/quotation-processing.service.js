import { ApiError } from "../utils/ApiError.js";

import {
  getQuotationById,
  createQuotationItems,
  updateQuotationStatus,
} from "../models/quotation.model.js";

import {
  getRequirementById,
} from "../models/requirement.model.js";

import {
  extractTextFromPDF,
} from "./pdf.service.js";

import {
  extractQuotationInformation,
} from "./ai.service.js";

import {
  processQuotationData,
} from "./validation.service.js";


// ================= PROCESS QUOTATION =================

const processQuotation = async ({
  quotationId,
  userId,
}) => {

  // ================= GET QUOTATION =================

  const quotation =
    getQuotationById(
      quotationId
    );


  if (!quotation) {
    throw new ApiError(
      404,
      "Quotation not found"
    );
  }


  // ================= GET REQUIREMENT =================

  const requirement =
    getRequirementById(
      quotation.requirementId,
      userId
    );


  if (!requirement) {
    throw new ApiError(
      404,
      "Purchase requirement not found"
    );
  }


  // ================= FILE TYPE =================

  if (
    quotation.fileType !== "pdf"
  ) {
    throw new ApiError(
      422,
      "Only PDF text extraction is currently supported"
    );
  }


  try {

    // ================= PROCESSING STATUS =================

    updateQuotationStatus(
      quotationId,
      "processing"
    );


    // ================= PDF EXTRACTION =================

    const pdfData =
      await extractTextFromPDF(
        quotation.fileUrl
      );


    // ================= AI EXTRACTION =================

    const aiData =
      await extractQuotationInformation(
        pdfData.text
      );


    // ================= VALIDATION + NORMALIZATION =================

    const processedData =
      processQuotationData(
        aiData
      );


    // ================= INVALID DATA =================

    if (
      !processedData.valid
    ) {

      updateQuotationStatus(
        quotationId,
        "needs_verification"
      );


      return {
        quotationId,

        status:
          "needs_verification",

        data:
          processedData.data,

        errors:
          processedData.errors,
      };
    }


    // ================= SAVE QUOTATION ITEMS =================

    const items =
      createQuotationItems(
        quotationId,
        processedData.data.items
      );


    // ================= UPDATE STATUS =================

    updateQuotationStatus(
      quotationId,
      "processed"
    );


    // ================= RESPONSE =================

    return {

      quotationId,

      status:
        "processed",

      supplierName:
        processedData.data
          .supplierName,

      items,

      pages:
        pdfData.pages,
    };

  } catch (error) {

    // ================= PROCESSING FAILED =================

    updateQuotationStatus(
      quotationId,
      "failed"
    );


    throw error;
  }
};


// ================= EXPORT =================

export {
  processQuotation,
};