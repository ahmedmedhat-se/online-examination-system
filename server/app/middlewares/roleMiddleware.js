export const authorize = (...allowedRoles) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({ message: "Unauthorized", success: false });
        }
        const role = req.user.user_role || req.user.role;
        if (!allowedRoles.includes(role)) {
            return res.status(403).json({ message: "Forbidden: Insufficient permissions", success: false });
        }
        next();
    };
};