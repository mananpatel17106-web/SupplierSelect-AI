import jwt from "jsonwebtoken";

import { ApiError } from "../utils/ApiError.js";
import { getUserById } from "../models/user.model.js";

const authMiddleware = (
  req,
  res,
  next
) => {
  try {
    const token =
      req.cookies?.accessToken ||
      req.headers.authorization?.replace(
        "Bearer ",
        ""
      );

    if (!token) {
      throw new ApiError(
        401,
        "Authentication required"
      );
    }

    const decoded = jwt.verify(
      token,
      process.env.ACCESS_TOKEN_SECRET
    );

    const user = getUserById(
      decoded.id
    );

    if (!user) {
      throw new ApiError(
        401,
        "User not found"
      );
    }

    req.user = user;

    next();
  } catch (error) {
    next(
      error instanceof ApiError
        ? error
        : new ApiError(
            401,
            "Invalid or expired token"
          )
    );
  }
};

export { authMiddleware };