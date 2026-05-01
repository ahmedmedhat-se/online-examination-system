import { db_config } from "../../config/database.js";

export const Course = {
    create: async (course) => {
        try {
            const stmt = `
                INSERT INTO courses (course_code, course_name, description, credit_hours)
                VALUES (?, ?, ?, ?)
            `;
            const [result] = await db_config.query(stmt, [
                course.course_code,
                course.course_name,
                course.description || null,
                course.credit_hours || 3,
            ]);
            return result.insertId;
        } catch (error) {
            console.error(`Course Creation Error: ${error}`);
            throw new Error(`Error Occurred While Creating Course: ${error}`);
        }
    },

    readAll: async () => {
        try {
            const [courses] = await db_config.query("SELECT * FROM courses ORDER BY course_name ASC");
            return courses;
        } catch (error) {
            console.error(`Failed To Fetch Courses: ${error}`);
            throw new Error(`Error Occurred While Fetching Courses: ${error}`);
        }
    },

    readById: async (course_id) => {
        try {
            const [course] = await db_config.query("SELECT * FROM courses WHERE course_id = ?", [course_id]);
            return course[0] || null;
        } catch (error) {
            console.error(`Failed To Fetch Course: ${error}`);
            throw new Error(`Error Occurred While Fetching Course: ${error}`);
        }
    },

    update: async (course_id, updates) => {
        try {
            const fields = [];
            const values = [];
            if (updates.course_code !== undefined) { fields.push("course_code = ?"); values.push(updates.course_code); }
            if (updates.course_name !== undefined) { fields.push("course_name = ?"); values.push(updates.course_name); }
            if (updates.description !== undefined) { fields.push("description = ?"); values.push(updates.description); }
            if (updates.credit_hours !== undefined) { fields.push("credit_hours = ?"); values.push(updates.credit_hours); }
            if (fields.length === 0) throw new Error("No fields to update");
            values.push(course_id);
            const [result] = await db_config.query(`UPDATE courses SET ${fields.join(", ")} WHERE course_id = ?`, values);
            return result.affectedRows;
        } catch (error) {
            console.error(`Course Update Error: ${error}`);
            throw new Error(`Error Occurred While Updating Course: ${error}`);
        }
    },

    delete: async (course_id) => {
        try {
            const [result] = await db_config.query("DELETE FROM courses WHERE course_id = ?", [course_id]);
            return result.affectedRows;
        } catch (error) {
            console.error(`Course Deletion Error: ${error}`);
            throw new Error(`Error Occurred While Deleting Course: ${error}`);
        }
    },

    getInstructorsByCourseId: async (course_id) => {
        try {
            const stmt = `
                SELECT i.*, u.first_name, u.last_name, u.email
                FROM course_instructors ci
                JOIN instructors i ON ci.instructor_id = i.instructor_id
                JOIN users u ON i.user_id = u.user_id
                WHERE ci.course_id = ?
            `;
            const [rows] = await db_config.query(stmt, [course_id]);
            return rows;
        } catch (error) {
            console.error(`Failed To Fetch Course Instructors: ${error}`);
            throw new Error(`Error Occurred While Fetching Course Instructors: ${error}`);
        }
    },

    assignInstructor: async (course_id, instructor_id) => {
        try {
            const [result] = await db_config.query(
                "INSERT INTO course_instructors (course_id, instructor_id) VALUES (?, ?)",
                [course_id, instructor_id]
            );
            return result.insertId;
        } catch (error) {
            console.error(`Course Instructor Assignment Error: ${error}`);
            throw new Error(`Error Occurred While Assigning Instructor: ${error}`);
        }
    },

    removeInstructor: async (course_id, instructor_id) => {
        try {
            const [result] = await db_config.query(
                "DELETE FROM course_instructors WHERE course_id = ? AND instructor_id = ?",
                [course_id, instructor_id]
            );
            return result.affectedRows;
        } catch (error) {
            console.error(`Course Instructor Removal Error: ${error}`);
            throw new Error(`Error Occurred While Removing Instructor: ${error}`);
        }
    },
};