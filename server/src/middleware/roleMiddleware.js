/**
 * Role-Based Access Control middleware
 * @param  {...string} allowedRoles - Array of permitted roles (e.g. 'vendor', 'admin')
 */
export const authorizeRoles = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        status: 'unauthorized',
        message: 'Authentication required prior to permission evaluation.'
      });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        status: 'forbidden',
        message: `Forbidden. Access requires one of the following roles: [${allowedRoles.join(', ')}].`,
        userRole: req.user.role
      });
    }

    next();
  };
};

export default authorizeRoles;
