import { ApiError } from "../utils/ApiError.js";
import { PDFParse } from "pdf-parse";

const extractTextFromPDF = async (fileUrl) => {
  let parser = null;

  try {
    if (!fileUrl) {
      throw new ApiError(400, "PDF URL is missing");
    }

    const response = await fetch(fileUrl);

    if (!response.ok) {
      throw new ApiError(
        400,
        `Unable to download quotation PDF. HTTP ${response.status}`
      );
    }

    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    if (!buffer.length) {
      throw new ApiError(422, "Downloaded PDF is empty");
    }

    parser = new PDFParse({
      data: buffer,
    });

    const data = await parser.getText();

    const text = data.text?.trim();

    if (!text) {
      throw new ApiError(
        422,
        "Unable to extract text from PDF. The document may be scanned or unreadable."
      );
    }

    return {
      text,
      pages: data.total,
    };
  } catch (error) {
    console.error("========== PDF ERROR ==========");
    console.error("Message:", error?.message);
    console.error("Full Error:", error);
    console.error("================================");

    if (error instanceof ApiError) {
      throw error;
    }

    throw new ApiError(
      500,
      "Failed to process PDF document"
    );
  } finally {
    if (parser) {
      await parser.destroy();
    }
  }
};

export { extractTextFromPDF };