import { db_config } from "../../config/database.js";

export const Student = {
    create: async (student) => {
        try {
            const stmt = `INSERT INTO students (user_id, phone, address_street, address_city, address_zip) VALUES (?, ?, ?, ?, ?)`;
            const [result] = await db_config.query(stmt, [student.user_id, student.phone || null, student.address_street || null, student.address_city || null, student.address_zip || null]);
            return result.insertId;
        } catch (error) {
            throw new Error(`Failed to create student: ${error.message}`);
        }
    },

    readById: async (student_id) => {
        try {
            const stmt = `SELECT s.*, u.first_name, u.last_name, u.email, u.is_active FROM students s JOIN users u ON s.user_id = u.user_id WHERE s.student_id = ?`;
            const [rows] = await db_config.query(stmt, [student_id]);
            return rows[0] || null;
        } catch (error) {
            throw new Error(`Failed to fetch student: ${error.message}`);
        }
    },

    readByUserId: async (user_id) => {
        try {
            const stmt = `SELECT s.*, u.first_name, u.last_name, u.email, u.is_active FROM students s JOIN users u ON s.user_id = u.user_id WHERE s.user_id = ?`;
            const [rows] = await db_config.query(stmt, [user_id]);
            return rows[0] || null;
        } catch (error) {
            throw new Error(`Failed to fetch student by user: ${error.message}`);
        }
    },

    readAll: async () => {
        try {
            const stmt = `SELECT s.*, u.first_name, u.last_name, u.email, u.is_active, u.last_login FROM students s JOIN users u ON s.user_id = u.user_id WHERE u.is_active = TRUE ORDER BY u.first_name`;
            const [rows] = await db_config.query(stmt);
            return rows;
        } catch (error) {
            throw new Error(`Failed to fetch students: ${error.message}`);
        }
    },

    update: async (student_id, updates) => {
        try {
            const fields = [];
            const values = [];
            if (updates.phone !== undefined) { fields.push("phone = ?"); values.push(updates.phone); }
            if (updates.address_street !== undefined) { fields.push("address_street = ?"); values.push(updates.address_street); }
            if (updates.address_city !== undefined) { fields.push("address_city = ?"); values.push(updates.address_city); }
            if (updates.address_zip !== undefined) { fields.push("address_zip = ?"); values.push(updates.address_zip); }
            if (fields.length === 0) throw new Error("No fields to update");
            values.push(student_id);
            const stmt = `UPDATE students SET ${fields.join(", ")} WHERE student_id = ?`;
            const [result] = await db_config.query(stmt, values);
            return result.affectedRows;
        } catch (error) {
            throw new Error(`Failed to update student: ${error.message}`);
        }
    },

    delete: async (student_id) => {
        try {
            const stmt = `DELETE FROM students WHERE student_id = ?`;
            const [result] = await db_config.query(stmt, [student_id]);
            return result.affectedRows;
        } catch (error) {
            throw new Error(`Failed to delete student: ${error.message}`);
        }
    },

    readEnrollments: async (student_id) => {
        try {
            const stmt = `SELECT e.*, ex.title, ex.duration_minutes, ex.total_marks, ex.passing_marks, ex.start_time, ex.end_time, c.course_name FROM exam_enrollments e JOIN exams ex ON e.exam_id = ex.exam_id JOIN courses c ON ex.course_id = c.course_id WHERE e.student_id = ? ORDER BY ex.start_time DESC`;
            const [rows] = await db_config.query(stmt, [student_id]);
            return rows;
        } catch (error) {
            throw new Error(`Failed to fetch enrollments: ${error.message}`);
        }
    },

    readAttempts: async (student_id) => {
        try {
            const stmt = `SELECT ea.*, ex.title, ex.total_marks, ex.passing_marks FROM exam_attempts ea JOIN exams ex ON ea.exam_id = ex.exam_id WHERE ea.student_id = ? ORDER BY ea.start_time DESC`;
            const [rows] = await db_config.query(stmt, [student_id]);
            return rows;
        } catch (error) {
            throw new Error(`Failed to fetch attempts: ${error.message}`);
        }
    }
};