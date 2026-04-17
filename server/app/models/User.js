import { db_config } from "../../config/database.js";

export const User = {
    create: async (user) => {
        try {
            const stmt = `
                INSERT INTO users 
                (user_email, user_password, user_role, user_first_name, user_last_name, user_date_of_birth) 
                VALUES (?, ?, ?, ?, ?, ?)
            `;

            const values = [
                user.user_email,
                user.user_password,
                user.user_role || "user",
                user.user_first_name,
                user.user_last_name,
                user.user_date_of_birth
            ];

            const [result] = await db_config.query(stmt, values);
            return result.insertId;
        } catch (error) {
            console.error(`User Creation Error: ${error}`);
            throw new Error(`Error Occurred While Creating User: ${error}`);
        };
    },

    readUserById: async (user_id) => {
        try {
            const stmt = `SELECT user_id, user_email, user_role, user_first_name, 
                user_last_name, user_date_of_birth, user_last_login, user_is_active, created_at, 
                updated_at 
                FROM users WHERE user_id = ?`;
            const [user] = await db_config.query(stmt, [user_id]);
            return user[0] || null;
        } catch (error) {
            console.error(`Failed To Fetch User Via ID: ${error}`);
            throw new Error(`Error Occurred While Fetching User Via ID: ${error}`);
        };
    },

    readUserByEmail: async (user_email) => {
        try {
            const stmt = `SELECT user_id, user_email, user_password, 
                user_role, user_first_name, 
                user_last_name, user_date_of_birth, user_last_login, user_is_active, created_at, 
                updated_at 
            FROM users WHERE user_email = ?`;
            const [user] = await db_config.query(stmt, [user_email]);
            return user[0] || null;
        } catch (error) {
            console.error(`Failed To Fetch User Via Email: ${error}`);
            throw new Error(`Error Occurred While Fetching User Via Email: ${error}`);
        };
    },

    readAllUsers: async () => {
        try {
            const stmt = `SELECT user_id, user_email, user_role, user_first_name, 
                user_last_name, user_date_of_birth, user_last_login, user_is_active, created_at, 
                updated_at
                FROM users WHERE user_is_active = 1`;
            const [users] = await db_config.query(stmt);
            return users;
        } catch (error) {
            console.error(`Failed To Fetch All Users: ${error}`);
            throw new Error(`Error Occurred While Fetching Users: ${error}`);
        };
    },

    update: async (user_id, updates) => {
        try {
            const fields = [];
            const values = [];

            if (updates.user_email !== undefined) {
                fields.push("user_email = ?");
                values.push(updates.user_email);
            };

            if (updates.user_password !== undefined) {
                fields.push("user_password = ?");
                values.push(updates.user_password);
            };

            if (updates.user_first_name !== undefined) {
                fields.push("user_first_name = ?");
                values.push(updates.user_first_name);
            };

            if (updates.user_last_name !== undefined) {
                fields.push("user_last_name = ?");
                values.push(updates.user_last_name);
            };

            if (updates.user_date_of_birth !== undefined) {
                fields.push("user_date_of_birth = ?");
                values.push(updates.user_date_of_birth);
            };

            if (updates.user_role !== undefined) {
                fields.push("user_role = ?");
                values.push(updates.user_role);
            };

            if (fields.length === 0) {
                throw new Error("No fields to update");
            };

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
            const stmt = "UPDATE users SET user_last_login = CURRENT_TIMESTAMP WHERE user_id = ?";
            const [result] = await db_config.query(stmt, [user_id]);
            return result.affectedRows;
        } catch (error) {
            console.error(`Update last login error: ${error.message}`);
            throw new Error(`Failed to update last login: ${error.message}`);
        }
    },

    softDelete: async (user_id) => {
        try {
            const stmt = "UPDATE users SET user_is_active = 0 WHERE user_id = ?";
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
        };
    }
};