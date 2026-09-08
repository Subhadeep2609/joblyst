export const authorizeRole = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      res.status(401);
      throw new Error('Authentication required before checking role permissions.');
    }

    if (!roles.includes(req.user.role)) {
      res.status(403);
      throw new Error(`Forbidden. Role '${req.user.role}' is not authorized to access this resource.`);
    }

    next();
  };
};
