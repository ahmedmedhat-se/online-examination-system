import { body, validationResult } from "express-validator";

export const authValidation = {
    register: [
        body("user_email")
            .isEmail().withMessage("Valid email is required")
            .normalizeEmail(),
        body("user_password")
            .isLength({ min: 8 }).withMessage("Password must be at least 8 characters")
            .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/).withMessage("Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character"),
        body("user_first_name")
            .notEmpty().withMessage("First name is required")
            .isLength({ max: 50 }).withMessage("First name must be less than 50 characters")
            .trim(),
        body("user_last_name")
            .notEmpty().withMessage("Last name is required")
            .isLength({ max: 50 }).withMessage("Last name must be less than 50 characters")
            .trim(),
        body("user_date_of_birth")
            .isISO8601().withMessage("Valid date of birth is required")
            .custom((value) => {
                const date = new Date(value);
                const today = new Date();
                const age = today.getFullYear() - date.getFullYear();
                const monthDiff = today.getMonth() - date.getMonth();
                if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < date.getDate())) {
                    return age - 1 >= 13;
                }
                return age >= 13;
            }).withMessage("User must be at least 13 years old"),
        body("user_role")
            .optional()
            .isIn(["user", "student", "instructor"]).withMessage("Invalid role"),
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
        body("user_email")
            .isEmail().withMessage("Valid email is required")
            .normalizeEmail(),
        body("user_password")
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
        body("user_first_name")
            .optional()
            .isLength({ max: 50 }).withMessage("First name must be less than 50 characters")
            .trim(),
        body("user_last_name")
            .optional()
            .isLength({ max: 50 }).withMessage("Last name must be less than 50 characters")
            .trim(),
        body("user_date_of_birth")
            .optional()
            .isISO8601().withMessage("Valid date of birth is required")
            .custom((value) => {
                const date = new Date(value);
                const today = new Date();
                const age = today.getFullYear() - date.getFullYear();
                const monthDiff = today.getMonth() - date.getMonth();
                if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < date.getDate())) {
                    return age - 1 >= 13;
                }
                return age >= 13;
            }).withMessage("User must be at least 13 years old"),
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