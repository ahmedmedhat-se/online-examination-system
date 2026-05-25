import { verifyAccessToken } from "../../utils/jwt.js";
import Instructor from "../models/Instructor.js";
import Admin from "../models/Admin.js";

export const authenticate = (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return res.status(401).json({ message: "Unauthorized. No Token Provided.", success: false });
        }

        const token = authHeader.split(" ")[1];
        const verification = verifyAccessToken(token);

        if (!verification.valid) {
            if (verification.expired) {
                return res.status(401).json({ message: "Token has been expired.", success: false });
            }
            return res.status(401).json({ message: "Invalid token.", success: false });
        }

        req.user = verification.decoded;
        next();
    } catch (error) {
        console.error(`Auth Middleware Error: ${error.message}`);
        return res.status(500).json({ message: "Internal Server Error.", success: false });
    }
};

export const attachRoleDetails = async (req, res, next) => {
    try {
        if (req.user.user_role === 'instructor') {
            const instructor = await Instructor.readByUserId(req.user.user_id);
            if (instructor) req.user.instructor_id = instructor.instructor_id;
        } else if (req.user.user_role === 'admin') {
            const admin = await Admin.readByUserId(req.user.user_id);
            if (admin) req.user.admin_id = admin.admin_id;
        }
        next();
    } catch (error) {
        console.error(`Attach Role Error: ${error.message}`);
        next();
    }
};