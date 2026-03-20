import { HttpError } from "http-errors-enhanced";
import logger from "./logger.js";
import { error } from "./response.js";

const errorHandler = (err, req, res, next) => {
  if (process.env.LOG_TYPE == "local") {
    logger.error(`${err.message} - ${req.id}`);
  } else {
    logger.error(err.stack, `${err.message} - ${req.id}`);
  }
  if (err instanceof HttpError) {
    return res
      .status(err.statusCode || 500)
      .json(error(err.message, { reqId: req.id, stack: err.stack }));
  }
  res.status(500).json(error(err.message, { reqId: req.id, stack: err.stack }));
};

export default errorHandler;
