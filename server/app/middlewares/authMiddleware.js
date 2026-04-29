import { verifyAccessToken } from "../../utils/jwt.js";

export const authenticate = (req, res, next) => {
    try {
        const token = req.cookies?.accessToken || req.headers.authorization?.split(" ")[1];

        if (!token) {
            return res.status(401).json({
                message: "Unauthorized. No Token Provided.",
                success: false
            });
        }

        const verification = verifyAccessToken(token);

        if (!verification.valid) {
            if (verification.expired) {
                return res.status(401).json({
                    message: "Token has been expired.",
                    success: false
                });
            }
            return res.status(401).json({
                message: "Invalid token.",
                success: false
            });
        }

        req.user = verification.decoded;
        next();
    } catch (error) {
        console.error("Auth middleware error:", error.message);
        return res.status(500).json({
            message: "Internal Server Error.",
            success: false
        });
    }
};