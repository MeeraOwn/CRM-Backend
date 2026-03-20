import User from "../models/user.js";
import { success, error } from "../utilities/response.js";
import { default as token } from "../utilities/token.js";
import logger from "../utilities/logger.js";
import bcrypt from "bcrypt";

const signIn = async (req, res) => {
  logger.info("signin called");

  try {
    const email =
      req.body?.emailAddress ??
      req.body?.email ??
      req.body?.customerEmail ??
      req.body?.userEmail;

    if (!email) {
      return res.status(400).json(error("Missing email"));
    }

    const password = req.body?.password;
    if (!password) {
      return res.status(400).json(error("Missing password"));
    }

    const result = await User.findByEmail(email);

    if (!result) {
      return res.status(401).json(error("Invalid email"));
    }

    const isMatch = await bcrypt.compare(req.body.password, result.password);

    if (!isMatch) {
      return res.status(401).json(error("Unauthorized"));
    }

    const accessToken = token.getAccessToken(result);
    const refreshToken = token.getRefreshToken(result);

    res.status(200).json(
      success("OK", {
        access_token: accessToken,
        refresh_token: refreshToken,
        role: result.role,
        user_id: result.id ?? result._id,
        firstName: result.first_name ?? result.firstName,
        lastName: result.last_name ?? result.lastName,
      })
    );
  } catch (err) {
    logger.error(err.message);
    res.status(500).json(error(err.message));
  }
};

const getNewAccessToken = async (req, res, next) => {
  logger.info("refreshNewToken called");

  try {
    let customer = token.verifyRefreshToken(req.body.refresh_token);
    if (customer) {
      let accessToken = token.getAccessToken(customer);
      res
        .status(200)
        .json(success("OK", { access_token: accessToken }, res.statusCode));
    }
  } catch (err) {
    next(err);
  }
};

export default {
  signIn,
  getNewAccessToken,
};
