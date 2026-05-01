export const authorize = (...allowedRoles) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({
                message: "Authentication required",
                success: false
            });
        };

        if (!allowedRoles.includes(req.user.user_role)) {
            return res.status(403).json({
                message: "Access denied. Insufficient permissions.",
                success: false 
            });
        };
        next();
    };
};