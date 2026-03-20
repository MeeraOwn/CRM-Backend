/**
 * @desc    This file contain Success and Error response for sending to client / user
 * @author  Huda Prasetyo
 * @since   2020
 */

/**
 * @desc    Send any success response
 *
 * @param   {string} message
 * @param   {object | array} results
 */
let success = (message, results) => {
  return {
    message,
    error: false,
    count: results?.length ? results.length : null,
    data: results,
  };
};

/**
 * @desc    Send any error response
 *
 * @param   {string} message
 * @param   {number} statusCode
 */
const error = (message, data) => {
  // List of common HTTP request code
  // const codes = [200, 201, 400, 401, 404, 403, 406, 422, 500];

  // // Get matched code
  // const findCode = codes.find((code) => code == statusCode);

  // if (!findCode) statusCode = 500;
  // else statusCode = findCode;

  return {
    message,
    error: true,
    data: data || {},
  };
};

/**
 * @desc    Send any validation response
 *
 * @param   {object | array} errors
 */
const validation = (errors) => {
  return {
    message: "Validation errors",
    error: true,
    code: 422,
    errors,
    data: {},
  };
};

export { success, error, validation };
