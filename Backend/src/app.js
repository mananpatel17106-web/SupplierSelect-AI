import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

import authRouter from "./routes/auth.routes.js";
import requirementRouter from "./routes/requirement.routes.js";
import quotationRouter from "./routes/quotation.routes.js";
import analysisRouter from "./routes/analysis.routes.js";


const app = express();


// ============================================================
// CORS
// ============================================================

app.use(
  cors({
    origin:
      process.env.CORS_ORIGIN ||
      "http://localhost:5173",

    credentials: true,
  })
);


// ============================================================
// BODY PARSERS
// ============================================================

app.use(
  express.json({
    limit: "10kb",
  })
);


app.use(
  express.urlencoded({
    extended: true,
    limit: "10kb",
  })
);


// ============================================================
// STATIC FILES
// ============================================================

app.use(
  express.static("public")
);


// ============================================================
// COOKIE PARSER
// ============================================================

app.use(
  cookieParser()
);


// ============================================================
// HEALTH CHECK
// ============================================================

app.get(
  "/",
  (req, res) => {

    return res
      .status(200)
      .json({
        success: true,
        message:
          "Supplier Quotation Backend is running",
      });
  }
);


// ============================================================
// API ROUTES
// ============================================================

app.use(
  "/api/v1/auth",
  authRouter
);


app.use(
  "/api/v1/requirements",
  requirementRouter
);


app.use(
  "/api/v1/quotations",
  quotationRouter
);


app.use(
  "/api/v1/analysis",
  analysisRouter
);


// ============================================================
// GLOBAL ERROR HANDLER
// ============================================================

app.use(
  (
    err,
    req,
    res,
    next
  ) => {

    const statusCode =
      err.statusCode || 500;


    return res
      .status(statusCode)
      .json({
        success: false,

        statusCode,

        message:
          err.message ||
          "Internal Server Error",

        errors:
          err.errors || [],

        data: null,
      });
  }
);


export {
  app,
};