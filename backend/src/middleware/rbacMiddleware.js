const ROLES = {
  USER: "user",
  ADMIN: "admin",
  REPRESENTATIVE: "representative",
  ORGANIZATION: "organization",
};

const rbac = (allowedRoles) => {
  const roles = Array.isArray(allowedRoles) ? allowedRoles : [allowedRoles];

  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: "Authentication required" });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        message: "Access forbidden",
        required: roles,
        current: req.user.role,
      });
    }

    next();
  };
};

module.exports = { rbac, ROLES };
