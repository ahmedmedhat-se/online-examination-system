import { body, validationResult } from "express-validator";

export const authValidation = {
    register: [
        body("email")
            .isEmail().withMessage("Valid email is required")
            .normalizeEmail(),
        body("password")
            .isLength({ min: 8 }).withMessage("Password must be at least 8 characters")
            .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/).withMessage("Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character"),
        body("first_name")
            .notEmpty().withMessage("First name is required")
            .isLength({ max: 50 }).withMessage("First name must be less than 50 characters")
            .trim(),
        body("last_name")
            .notEmpty().withMessage("Last name is required")
            .isLength({ max: 50 }).withMessage("Last name must be less than 50 characters")
            .trim(),
        body("role")
            .optional()
            .isIn(["student", "instructor", "admin"]).withMessage("Invalid role"),
        (req, res, next) => {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({
                    message: "Validation failed",
                    success: false,
                    errors: errors.array()
                });
            }
            next();
        }
    ],

    login: [
        body("email")
            .isEmail().withMessage("Valid email is required")
            .normalizeEmail(),
        body("password")
            .notEmpty().withMessage("Password is required"),
        (req, res, next) => {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({
                    message: "Validation failed",
                    success: false,
                    errors: errors.array()
                });
            }
            next();
        }
    ],

    updateProfile: [
        body("first_name")
            .optional()
            .isLength({ max: 50 }).withMessage("First name must be less than 50 characters")
            .trim(),
        body("last_name")
            .optional()
            .isLength({ max: 50 }).withMessage("Last name must be less than 50 characters")
            .trim(),
        (req, res, next) => {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({
                    message: "Validation failed",
                    success: false,
                    errors: errors.array()
                });
            }
            next();
        }
    ],

    changePassword: [
        body("current_password")
            .notEmpty().withMessage("Current password is required"),
        body("new_password")
            .isLength({ min: 8 }).withMessage("New password must be at least 8 characters")
            .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/).withMessage("New password must contain at least one uppercase letter, one lowercase letter, one number, and one special character"),
        (req, res, next) => {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({
                    message: "Validation failed",
                    success: false,
                    errors: errors.array()
                });
            }
            next();
        }
    ]
};