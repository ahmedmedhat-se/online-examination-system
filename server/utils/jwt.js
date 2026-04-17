import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();

const requiredEnvVars = [
    'JWT_ACCESS_SECRET',
    'JWT_REFRESH_SECRET',
    'JWT_ACCESS_EXPIRES_IN',
    'JWT_REFRESH_EXPIRES_IN',
    'JWT_ISSUER',
    'JWT_AUDIENCE'
];

requiredEnvVars.forEach(varName => {
    if (!process.env[varName]) {
        throw new Error(`Missing required environment variable: ${varName}`);
    }
});

export const generateTokens = (user) => {
    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);
    return { accessToken, refreshToken };
};

export const generateAccessToken = (user) => {
    return jwt.sign(
        {
            user_id: user.user_id,
            user_role: user.user_role,
            timestamp: user.created_at,
        },
        process.env.JWT_ACCESS_SECRET,
        {
            expiresIn: process.env.JWT_ACCESS_EXPIRES_IN,
            issuer: process.env.JWT_ISSUER,
            audience: process.env.JWT_AUDIENCE
        }
    );
};

export const generateRefreshToken = (user) => {
    return jwt.sign(
        {
            user_id: user.user_id,
            user_role: user.user_role,
            timestamp: user.created_at,
        },
        process.env.JWT_REFRESH_SECRET,
        {
            expiresIn: process.env.JWT_REFRESH_EXPIRES_IN,
            issuer: process.env.JWT_ISSUER,
            audience: process.env.JWT_AUDIENCE
        }
    );
};

export const verifyAccessToken = (token) => {
    try {
        const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET, {
            issuer: process.env.JWT_ISSUER,
            audience: process.env.JWT_AUDIENCE
        });
        return { valid: true, decoded };
    } catch (error) {
        if (error.name === 'TokenExpiredError') {
            return { valid: false, expired: true };
        }
        if (error.name === 'JsonWebTokenError') {
            return { valid: false, invalid: true };
        }
        return { valid: false, error: error.message };
    };
};

export const verifyRefreshToken = (token) => {
    try {
        const decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET, {
            issuer: process.env.JWT_ISSUER,
            audience: process.env.JWT_AUDIENCE
        });

        return { valid: true, decoded };
    } catch (error) {
        if (error.name === 'TokenExpiredError') {
            return { valid: false, expired: true };
        };
        if (error.name === 'JsonWebTokenError') {
            return { valid: false, invalid: true };
        };
        return { valid: false, error: error.message };
    };
};