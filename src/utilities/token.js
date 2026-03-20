import { createError } from "http-errors-enhanced";
import jwt from "jsonwebtoken";

const getAccessToken = (result) => {
  try {
    // Keep claims simple so frontend can read roles from JWT.
    // We use `sub` for ownership checks (history.created_by === token.sub).
    const sub =
      result?.sub ??
      result?.id ??
      result?._id ??
      result?.customer_id ??
      result?.customerId;
    const role = result?.role;
    const first_name = result?.first_name ?? result?.firstName;
    const last_name = result?.last_name ?? result?.lastName;

    const token = jwt.sign(
      {
        sub,
        role,
        first_name,
        last_name,
      },
      process.env.ACCESS_SECRET,
      {
        expiresIn: process.env.ACCESS_TOKEN_EXPIRE,
        issuer: "amphe-OneStopPortal",
      },
    );
    return token;
  } catch (err) {
    throw createError(err);
  }
};

const getRefreshToken = (result) => {
  try {
    const sub =
      result?.sub ??
      result?.id ??
      result?._id ??
      result?.customer_id ??
      result?.customerId;
    const role = result?.role;
    const token = jwt.sign(
      {
        sub,
        role,
      },
      process.env.REFRESH_SECRET,
      {
        expiresIn: process.env.REFRESH_TOKEN_EXPIRE,
        issuer: "amphe-OneStopPortal",
      },
    );
    return token;
  } catch (err) {
    throw createError(err);
  }
};

const verifyRefreshToken = (token) => {
  try {
    return jwt.verify(token, process.env.REFRESH_SECRET);
  } catch (err) {
    throw createError(err);
  }
};

export default { getAccessToken, getRefreshToken, verifyRefreshToken };
