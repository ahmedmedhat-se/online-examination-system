import { db_config } from "../../database/mysql.js"

export const User = {
    create: async (user) => {
        try {
            const stmt = `
                INSERT INTO users 
                (email, password_hash, role, first_name, last_name) 
                VALUES (?, ?, ?, ?, ?)
            `;

            const values = [
                user.email,
                user.password_hash,
                user.role || "student",
                user.first_name,
                user.last_name
            ];

            const [result] = await db_config.query(stmt, values);
            return result.insertId;
        } catch (error) {
            console.error(`User Creation Error: ${error}`);
            throw new Error(`Error Occurred While Creating User: ${error}`);
        }
    },

    readUserById: async (user_id) => {
        try {
            const stmt = `SELECT user_id, email, role, first_name, 
                last_name, last_login, is_active, created_at, 
                updated_at 
                FROM users WHERE user_id = ?`;
            const [user] = await db_config.query(stmt, [user_id]);
            return user[0] || null;
        } catch (error) {
            console.error(`Failed To Fetch User Via ID: ${error}`);
            throw new Error(`Error Occurred While Fetching User Via ID: ${error}`);
        }
    },

    readUserByEmail: async (email) => {
        try {
            const stmt = `SELECT user_id, email, password_hash, 
                role, first_name, 
                last_name, last_login, is_active, created_at, 
                updated_at 
            FROM users WHERE email = ?`;
            const [user] = await db_config.query(stmt, [email]);
            return user[0] || null;
        } catch (error) {
            console.error(`Failed To Fetch User Via Email: ${error}`);
            throw new Error(`Error Occurred While Fetching User Via Email: ${error}`);
        }
    },

    readAllUsers: async () => {
        try {
            const stmt = `SELECT user_id, email, role, first_name, 
                last_name, last_login, is_active, created_at, 
                updated_at
                FROM users WHERE is_active = TRUE`;
            const [users] = await db_config.query(stmt);
            return users;
        } catch (error) {
            console.error(`Failed To Fetch All Users: ${error}`);
            throw new Error(`Error Occurred While Fetching Users: ${error}`);
        }
    },

    update: async (user_id, updates) => {
        try {
            const fields = [];
            const values = [];

            if (updates.email !== undefined) {
                fields.push("email = ?");
                values.push(updates.email);
            }

            if (updates.password_hash !== undefined) {
                fields.push("password_hash = ?");
                values.push(updates.password_hash);
            }

            if (updates.first_name !== undefined) {
                fields.push("first_name = ?");
                values.push(updates.first_name);
            }

            if (updates.last_name !== undefined) {
                fields.push("last_name = ?");
                values.push(updates.last_name);
            }

            if (updates.role !== undefined) {
                fields.push("role = ?");
                values.push(updates.role);
            }

            if (updates.is_active !== undefined) {
                fields.push("is_active = ?");
                values.push(updates.is_active);
            }

            if (fields.length === 0) {
                throw new Error("No fields to update");
            }

            fields.push("updated_at = CURRENT_TIMESTAMP");
            values.push(user_id);

            const stmt = `UPDATE users SET ${fields.join(", ")} WHERE user_id = ?`;
            const [result] = await db_config.query(stmt, values);

            return result.affectedRows;
        } catch (error) {
            console.error(`User update error: ${error.message}`);
            throw new Error(`Failed to update user: ${error.message}`);
        }
    },
    
    updateLastLogin: async (user_id) => {
        try {
            const stmt = "UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE user_id = ?";
            const [result] = await db_config.query(stmt, [user_id]);
            return result.affectedRows;
        } catch (error) {
            console.error(`Update last login error: ${error.message}`);
            throw new Error(`Failed to update last login: ${error.message}`);
        }
    },

    softDelete: async (user_id) => {
        try {
            const stmt = "UPDATE users SET is_active = FALSE WHERE user_id = ?";
            const [result] = await db_config.query(stmt, [user_id]);
            return result.affectedRows;
        } catch (error) {
            console.error(`Soft User Deletion: ${error.message}`);
            throw new Error(`Error Occurred While Deleting User: ${error}`);
        }
    },

    hardDelete: async (user_id) => {
        try {
            const stmt = "DELETE FROM users WHERE user_id = ?";
            const [result] = await db_config.query(stmt, [user_id]);
            return result.affectedRows;
        } catch (error) {
            console.error(`Hard User Deletion: ${error.message}`);
            throw new Error(`Error Occurred While Deleting User: ${error}`);
        }
    }
};