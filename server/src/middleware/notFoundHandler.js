/**
 * Handle 404 Not Found for unmatched API routes
 */
export const notFoundHandler = (req, res) => {
  res.status(404).json({
    success: false,
    status: 'error',
    message: `Cannot ${req.method} ${req.originalUrl}`,
    error: {
      code: 'ROUTE_NOT_FOUND',
      path: req.originalUrl,
      method: req.method
    }
  });
};

export default notFoundHandler;
