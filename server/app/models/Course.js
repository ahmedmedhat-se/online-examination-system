import { DataTypes } from "sequelize";
import { sequelize } from "../../database/mysql.js";

const Course = sequelize.define('Course', {
    course_id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    course_code: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
    },
    course_name: {
        type: DataTypes.STRING,
        allowNull: false
    },
    description: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    credit_hours: {
        type: DataTypes.INTEGER,
        defaultValue: 3
    }
}, {
    tableName: 'courses',
    timestamps: false
});

export const CourseModel = {
    create: async (course) => {
        try {
            const result = await Course.create({
                course_code: course.course_code,
                course_name: course.course_name,
                description: course.description || null,
                credit_hours: course.credit_hours || 3
            });
            return result.course_id;
        } catch (error) {
            console.error(`Course Creation Error: ${error}`);
            throw new Error(`Error Occurred While Creating Course: ${error}`);
        }
    },

    readAll: async () => {
        try {
            const courses = await Course.findAll({
                order: [['course_name', 'ASC']]
            });
            return courses.map(c => c.toJSON());
        } catch (error) {
            console.error(`Failed To Fetch Courses: ${error}`);
            throw new Error(`Error Occurred While Fetching Courses: ${error}`);
        }
    },

    readById: async (course_id) => {
        try {
            const course = await Course.findByPk(course_id);
            return course ? course.toJSON() : null;
        } catch (error) {
            console.error(`Failed To Fetch Course: ${error}`);
            throw new Error(`Error Occurred While Fetching Course: ${error}`);
        }
    },

    update: async (course_id, updates) => {
        try {
            const updateData = {};
            if (updates.course_code !== undefined) updateData.course_code = updates.course_code;
            if (updates.course_name !== undefined) updateData.course_name = updates.course_name;
            if (updates.description !== undefined) updateData.description = updates.description;
            if (updates.credit_hours !== undefined) updateData.credit_hours = updates.credit_hours;

            if (Object.keys(updateData).length === 0) throw new Error("No fields to update");

            const [affectedRows] = await Course.update(updateData, {
                where: { course_id }
            });

            return affectedRows;
        } catch (error) {
            console.error(`Course Update Error: ${error}`);
            throw new Error(`Error Occurred While Updating Course: ${error}`);
        }
    },

    delete: async (course_id) => {
        try {
            const result = await Course.destroy({
                where: { course_id }
            });
            return result;
        } catch (error) {
            console.error(`Course Deletion Error: ${error}`);
            throw new Error(`Error Occurred While Deleting Course: ${error}`);
        }
    },

    getInstructorsByCourseId: async (course_id) => {
        try {
            const [rows] = await sequelize.query(`
                SELECT i.*, u.first_name, u.last_name, u.email
                FROM course_instructors ci
                JOIN instructors i ON ci.instructor_id = i.instructor_id
                JOIN users u ON i.user_id = u.user_id
                WHERE ci.course_id = ?
            `, { replacements: [course_id] });
            return rows;
        } catch (error) {
            console.error(`Failed To Fetch Course Instructors: ${error}`);
            throw new Error(`Error Occurred While Fetching Course Instructors: ${error}`);
        }
    },

    assignInstructor: async (course_id, instructor_id) => {
        try {
            const [result] = await sequelize.query(
                "INSERT INTO course_instructors (course_id, instructor_id) VALUES (?, ?)",
                { replacements: [course_id, instructor_id] }
            );
            return result;
        } catch (error) {
            console.error(`Course Instructor Assignment Error: ${error}`);
            throw new Error(`Error Occurred While Assigning Instructor: ${error}`);
        }
    },

    removeInstructor: async (course_id, instructor_id) => {
        try {
            const [result] = await sequelize.query(
                "DELETE FROM course_instructors WHERE course_id = ? AND instructor_id = ?",
                { replacements: [course_id, instructor_id] }
            );
            return result.affectedRows;
        } catch (error) {
            console.error(`Course Instructor Removal Error: ${error}`);
            throw new Error(`Error Occurred While Removing Instructor: ${error}`);
        }
    }
};

export default Course;