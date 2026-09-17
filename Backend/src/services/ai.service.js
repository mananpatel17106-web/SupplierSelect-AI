import "dotenv/config";
import { GoogleGenAI } from "@google/genai";
import { ApiError } from "../utils/ApiError.js";

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

const quotationSchema = {
  type: "object",

  properties: {
    supplierName: {
      type: ["string", "null"],
      description:
        "Supplier or vendor name exactly as mentioned in the quotation.",
    },

    items: {
      type: "array",

      items: {
        type: "object",

        properties: {
          productName: {
            type: ["string", "null"],
            description: "Product or item name mentioned in the quotation.",
          },

          quantity: {
            type: ["number", "null"],
            description: "Quoted quantity. Return null if not specified.",
          },

          unitPrice: {
            type: ["number", "null"],
            description: "Price per unit. Return null if not specified.",
          },

          totalPrice: {
            type: ["number", "null"],
            description:
              "Total price for the item. Return null if not specified.",
          },

          deliveryDays: {
            type: ["number", "null"],
            description:
              "Delivery time converted to number of days. Return null if not specified.",
          },

          warrantyYears: {
            type: ["number", "null"],
            description:
              "Warranty duration converted to years. Return null if not specified.",
          },

          paymentTerms: {
            type: ["string", "null"],
            description: "Payment terms exactly as mentioned in the quotation.",
          },
        },

        required: [
          "productName",
          "quantity",
          "unitPrice",
          "totalPrice",
          "deliveryDays",
          "warrantyYears",
          "paymentTerms",
        ],
      },
    },
  },

  required: ["supplierName", "items"],
};

// ================= AI EXTRACTION =================

const extractQuotationInformation = async (text) => {
  if (!text || !text.trim()) {
    throw new ApiError(400, "Quotation text is empty");
  }

  if (!process.env.GEMINI_API_KEY) {
    throw new ApiError(500, "Gemini API key is not configured");
  }

  const prompt = `
You are an AI system specialized in supplier quotation analysis.

Your task is to extract structured information from the supplier quotation text below.

IMPORTANT RULES:

1. Extract information ONLY from the provided quotation text.
2. NEVER invent or guess missing information.
3. If a value is not present, return null.
4. Do not calculate values that are not explicitly supported by the document.
5. Preserve the supplier's actual information.
6. If there are multiple products/items, return every item separately.
7. Convert numeric values into numbers, not strings.
8. Delivery must be represented in days.
9. Warranty must be represented in years.
10. Payment terms should remain as text.
11. Return only the requested JSON structure.
12. Do not include explanations outside the JSON.

QUOTATION TEXT:

${text}
`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash-lite",

      contents: prompt,

      config: {
        responseMimeType: "application/json",

        responseSchema: quotationSchema,

        thinkingConfig: {
          thinkingLevel: "low",
        },
      },
    });

    const responseText = response.text?.trim();

    if (!responseText) {
      throw new ApiError(502, "Gemini returned an empty response");
    }

    let parsedData;

    try {
      parsedData = JSON.parse(responseText);
    } catch (error) {
      throw new ApiError(502, "Gemini returned invalid JSON");
    }

    return parsedData;
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError(
      502,
      "Failed to extract quotation information using Gemini",
    );
  }
};

export { extractQuotationInformation };
