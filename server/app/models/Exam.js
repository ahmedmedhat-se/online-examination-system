import { DataTypes } from "sequelize";
import { sequelize } from "../../database/mysql.js";

const Exam = sequelize.define('Exam', {
    exam_id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    title: {
        type: DataTypes.STRING,
        allowNull: false
    },
    description: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    duration_minutes: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    total_marks: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    passing_marks: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    start_time: {
        type: DataTypes.DATE,
        allowNull: false
    },
    end_time: {
        type: DataTypes.DATE,
        allowNull: false
    },
    is_published: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    },
    course_id: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    category_id: {
        type: DataTypes.INTEGER,
        allowNull: true
    },
    instructor_id: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    created_at: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
    }
}, {
    tableName: 'exams',
    timestamps: false
});

export const ExamModel = {
    create: async (exam) => {
        try {
            const result = await Exam.create({
                title: exam.title,
                description: exam.description || null,
                duration_minutes: exam.duration_minutes,
                total_marks: exam.total_marks,
                passing_marks: exam.passing_marks,
                start_time: exam.start_time,
                end_time: exam.end_time,
                is_published: exam.is_published || false,
                course_id: exam.course_id,
                category_id: exam.category_id || null,
                instructor_id: exam.instructor_id
            });
            return result.exam_id;
        } catch (error) {
            console.error(`Exam Creation Error: ${error}`);
            throw new Error(`Error Occurred While Creating Exam: ${error}`);
        }
    },

    readAll: async () => {
        try {
            const [exams] = await sequelize.query(`
                SELECT e.*, c.course_name, c.course_code, cat.category_name,
                       u.first_name AS instructor_first_name, u.last_name AS instructor_last_name
                FROM exams e
                JOIN courses c ON e.course_id = c.course_id
                LEFT JOIN categories cat ON e.category_id = cat.category_id
                JOIN instructors i ON e.instructor_id = i.instructor_id
                JOIN users u ON i.user_id = u.user_id
                ORDER BY e.start_time DESC
            `);
            return exams;
        } catch (error) {
            console.error(`Failed To Fetch Exams: ${error}`);
            throw new Error(`Error Occurred While Fetching Exams: ${error}`);
        }
    },

    readById: async (exam_id) => {
        try {
            const [exam] = await sequelize.query(`
                SELECT e.*, c.course_name, c.course_code, cat.category_name,
                       u.first_name AS instructor_first_name, u.last_name AS instructor_last_name
                FROM exams e
                JOIN courses c ON e.course_id = c.course_id
                LEFT JOIN categories cat ON e.category_id = cat.category_id
                JOIN instructors i ON e.instructor_id = i.instructor_id
                JOIN users u ON i.user_id = u.user_id
                WHERE e.exam_id = ?
            `, { replacements: [exam_id] });
            return exam[0] || null;
        } catch (error) {
            console.error(`Failed To Fetch Exam: ${error}`);
            throw new Error(`Error Occurred While Fetching Exam: ${error}`);
        }
    },

    readByInstructorId: async (instructor_id) => {
        try {
            const [exams] = await sequelize.query(`
                SELECT e.*, c.course_name, c.course_code, cat.category_name
                FROM exams e
                JOIN courses c ON e.course_id = c.course_id
                LEFT JOIN categories cat ON e.category_id = cat.category_id
                WHERE e.instructor_id = ?
                ORDER BY e.start_time DESC
            `, { replacements: [instructor_id] });
            return exams;
        } catch (error) {
            console.error(`Failed To Fetch Instructor Exams: ${error}`);
            throw new Error(`Error Occurred While Fetching Instructor Exams: ${error}`);
        }
    },

    readByCourseId: async (course_id) => {
        try {
            const [exams] = await sequelize.query(`
                SELECT e.*, cat.category_name
                FROM exams e
                LEFT JOIN categories cat ON e.category_id = cat.category_id
                WHERE e.course_id = ?
                ORDER BY e.start_time DESC
            `, { replacements: [course_id] });
            return exams;
        } catch (error) {
            console.error(`Failed To Fetch Course Exams: ${error}`);
            throw new Error(`Error Occurred While Fetching Course Exams: ${error}`);
        }
    },

    update: async (exam_id, updates) => {
        try {
            const updateData = {};
            const allowedFields = ["title", "description", "duration_minutes", "total_marks", "passing_marks", "start_time", "end_time", "is_published", "course_id", "category_id"];
            allowedFields.forEach(field => {
                if (updates[field] !== undefined) updateData[field] = updates[field];
            });
            
            if (Object.keys(updateData).length === 0) throw new Error("No fields to update");
            
            const [result] = await Exam.update(updateData, {
                where: { exam_id }
            });
            return result;
        } catch (error) {
            console.error(`Exam Update Error: ${error}`);
            throw new Error(`Error Occurred While Updating Exam: ${error}`);
        }
    },

    delete: async (exam_id) => {
        try {
            const result = await Exam.destroy({
                where: { exam_id }
            });
            return result;
        } catch (error) {
            console.error(`Exam Deletion Error: ${error}`);
            throw new Error(`Error Occurred While Deleting Exam: ${error}`);
        }
    },

    enrollStudent: async (exam_id, student_id) => {
        try {
            const [result] = await sequelize.query(
                "INSERT INTO exam_enrollments (exam_id, student_id) VALUES (?, ?)",
                { replacements: [exam_id, student_id] }
            );
            return result;
        } catch (error) {
            console.error(`Exam Enrollment Error: ${error}`);
            throw new Error(`Error Occurred While Enrolling Student: ${error}`);
        }
    },

    getEnrolledStudents: async (exam_id) => {
        try {
            const [rows] = await sequelize.query(`
                SELECT s.*, u.first_name, u.last_name, u.email, ee.enrolled_at
                FROM exam_enrollments ee
                JOIN students s ON ee.student_id = s.student_id
                JOIN users u ON s.user_id = u.user_id
                WHERE ee.exam_id = ?
            `, { replacements: [exam_id] });
            return rows;
        } catch (error) {
            console.error(`Failed To Fetch Enrolled Students: ${error}`);
            throw new Error(`Error Occurred While Fetching Enrolled Students: ${error}`);
        }
    },

    getStudentExams: async (student_id) => {
        try {
            const [rows] = await sequelize.query(`
                SELECT e.*, c.course_name, c.course_code, ee.enrolled_at
                FROM exam_enrollments ee
                JOIN exams e ON ee.exam_id = e.exam_id
                JOIN courses c ON e.course_id = c.course_id
                WHERE ee.student_id = ?
                ORDER BY e.start_time DESC
            `, { replacements: [student_id] });
            return rows;
        } catch (error) {
            console.error(`Failed To Fetch Student Exams: ${error}`);
            throw new Error(`Error Occurred While Fetching Student Exams: ${error}`);
        }
    }
};

export default Exam;