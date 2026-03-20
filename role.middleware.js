/**
 * Role based access control middleware
 * Usage:
 * role("recruiter")
 * role(["recruiter", "admin"])
 */

module.exports = (roles) => {
  return (req, res, next) => {

    // 🔐 auth middleware se user aaya ya nahi
    if (!req.user) {
      return res.status(401).json({
        success: false,
        msg: "Unauthorized: user not authenticated"
      });
    }

    // 🎭 role check
    const userRole = req.user.role;

    if (!userRole) {
      return res.status(403).json({
        success: false,
        msg: "User role missing"
      });
    }

    // 🔁 Allow single role OR multiple roles
    if (Array.isArray(roles)) {
      if (!roles.includes(userRole)) {
        return res.status(403).json({
          success: false,
          msg: "Access denied"
        });
      }
    } else {
      if (userRole !== roles) {
        return res.status(403).json({
          success: false,
          msg: "Access denied"
        });
      }
    }

    // ✅ all good
    next();
  };
};
