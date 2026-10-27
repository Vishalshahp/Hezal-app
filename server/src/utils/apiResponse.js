/**
 * Standardized API success response
 */
export const successResponse = (res, statusCode = 200, message = 'Success', data = null, extra = {}) => {
  const payload = {
    success: true,
    message,
    status: 'ok',
    ...extra
  };

  if (data !== null) {
    payload.data = data;
  }

  return res.status(statusCode).json(payload);
};

/**
 * Standardized API error response
 */
export const errorResponse = (res, statusCode = 500, message = 'Internal Server Error', errorDetails = null) => {
  const payload = {
    success: false,
    message,
    status: 'error'
  };

  if (errorDetails) {
    payload.error = errorDetails;
  }

  return res.status(statusCode).json(payload);
};
