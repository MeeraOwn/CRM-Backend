import { createError } from "http-errors-enhanced";
import jwt from "jsonwebtoken";

const verifyToken = (req, _, next) => {
  const token = req.headers["x-access-token"];
  try {
    if (!token) {
      throw createError(403, "A token is required for authentication");
    }
    const decoded = jwt.verify(token, process.env.ACCESS_SECRET);
    req.user = decoded;
  } catch (err) {
    next(err);
  }
  return next();
};

export { verifyToken };
