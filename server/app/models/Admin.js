import { db_config } from "../../config/database.js";

export const Admin = {
    create: async (admin) => {
        try {
            const stmt = `INSERT INTO admins (user_id, access_level) VALUES (?, ?)`;
            const [result] = await db_config.query(stmt, [admin.user_id, admin.access_level || 'full']);
            return result.insertId;
        } catch (error) {
            throw new Error(`Failed to create admin: ${error.message}`);
        }
    },

    readById: async (admin_id) => {
        try {
            const stmt = `SELECT a.*, u.first_name, u.last_name, u.email, u.is_active FROM admins a JOIN users u ON a.user_id = u.user_id WHERE a.admin_id = ?`;
            const [rows] = await db_config.query(stmt, [admin_id]);
            return rows[0] || null;
        } catch (error) {
            throw new Error(`Failed to fetch admin: ${error.message}`);
        }
    },

    readByUserId: async (user_id) => {
        try {
            const stmt = `SELECT a.*, u.first_name, u.last_name, u.email, u.is_active FROM admins a JOIN users u ON a.user_id = u.user_id WHERE a.user_id = ?`;
            const [rows] = await db_config.query(stmt, [user_id]);
            return rows[0] || null;
        } catch (error) {
            throw new Error(`Failed to fetch admin by user: ${error.message}`);
        }
    },

    readAll: async () => {
        try {
            const stmt = `SELECT a.*, u.first_name, u.last_name, u.email, u.is_active, u.last_login FROM admins a JOIN users u ON a.user_id = u.user_id WHERE u.is_active = TRUE ORDER BY u.first_name`;
            const [rows] = await db_config.query(stmt);
            return rows;
        } catch (error) {
            throw new Error(`Failed to fetch admins: ${error.message}`);
        }
    },

    update: async (admin_id, updates) => {
        try {
            const fields = [];
            const values = [];
            if (updates.access_level !== undefined) { fields.push("access_level = ?"); values.push(updates.access_level); }
            if (fields.length === 0) throw new Error("No fields to update");
            values.push(admin_id);
            const stmt = `UPDATE admins SET ${fields.join(", ")} WHERE admin_id = ?`;
            const [result] = await db_config.query(stmt, values);
            return result.affectedRows;
        } catch (error) {
            throw new Error(`Failed to update admin: ${error.message}`);
        }
    },

    delete: async (admin_id) => {
        try {
            const stmt = `DELETE FROM admins WHERE admin_id = ?`;
            const [result] = await db_config.query(stmt, [admin_id]);
            return result.affectedRows;
        } catch (error) {
            throw new Error(`Failed to delete admin: ${error.message}`);
        }
    },

    readStats: async () => {
        try {
            const [userCount] = await db_config.query(`SELECT COUNT(*) as total FROM users WHERE is_active = TRUE`);
            const [studentCount] = await db_config.query(`SELECT COUNT(*) as total FROM students`);
            const [instructorCount] = await db_config.query(`SELECT COUNT(*) as total FROM instructors`);
            const [examCount] = await db_config.query(`SELECT COUNT(*) as total FROM exams`);
            const [courseCount] = await db_config.query(`SELECT COUNT(*) as total FROM courses`);
            return {
                users: userCount[0].total,
                students: studentCount[0].total,
                instructors: instructorCount[0].total,
                exams: examCount[0].total,
                courses: courseCount[0].total
            };
        } catch (error) {
            throw new Error(`Failed to fetch stats: ${error.message}`);
        }
    }
};