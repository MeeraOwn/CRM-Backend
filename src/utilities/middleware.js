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

const verifyRequest = (schema, property) => {
  return (req, res, next) => {
    const { error } = schema.validate(req[property]);
    const valid = error == null;
    if (valid) {
      next();
    } else {
      const { details } = error;
      const message = details.map((i) => i.message).join(",");
      throw createError(422, message);
    }
  };
};

export { verifyRequest, verifyToken };
