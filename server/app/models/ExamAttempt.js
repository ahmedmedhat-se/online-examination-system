import { DataTypes } from "sequelize";
import { sequelize } from "../../database/mysql.js";

const ExamAttempt = sequelize.define('ExamAttempt', {
    attempt_id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    student_id: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    exam_id: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    start_time: {
        type: DataTypes.DATE,
        allowNull: false
    },
    end_time: {
        type: DataTypes.DATE,
        allowNull: true
    },
    score: {
        type: DataTypes.INTEGER,
        allowNull: true
    }
}, {
    tableName: 'exam_attempts',
    timestamps: false
});

export const ExamAttemptModel = {
    create: async (attempt) => {
        try {
            const result = await ExamAttempt.create({
                student_id: attempt.student_id,
                exam_id: attempt.exam_id,
                start_time: attempt.start_time || new Date(),
                end_time: attempt.end_time || null,
                score: attempt.score || null
            });
            return result.attempt_id;
        } catch (error) {
            console.error(`Exam Attempt Creation Error: ${error}`);
            throw new Error(`Error Occurred While Creating Exam Attempt: ${error}`);
        }
    },

    readByStudentId: async (student_id) => {
        try {
            const [attempts] = await sequelize.query(`
                SELECT ea.*, e.title AS exam_title, c.course_name
                FROM exam_attempts ea
                JOIN exams e ON ea.exam_id = e.exam_id
                JOIN courses c ON e.course_id = c.course_id
                WHERE ea.student_id = ?
                ORDER BY ea.start_time DESC
            `, { replacements: [student_id] });
            return attempts;
        } catch (error) {
            console.error(`Failed To Fetch Student Attempts: ${error}`);
            throw new Error(`Error Occurred While Fetching Student Attempts: ${error}`);
        }
    },

    readByExamId: async (exam_id) => {
        try {
            const [attempts] = await sequelize.query(`
                SELECT ea.*, u.first_name, u.last_name, u.email
                FROM exam_attempts ea
                JOIN students s ON ea.student_id = s.student_id
                JOIN users u ON s.user_id = u.user_id
                WHERE ea.exam_id = ?
                ORDER BY ea.start_time DESC
            `, { replacements: [exam_id] });
            return attempts;
        } catch (error) {
            console.error(`Failed To Fetch Exam Attempts: ${error}`);
            throw new Error(`Error Occurred While Fetching Exam Attempts: ${error}`);
        }
    },

    readById: async (attempt_id) => {
        try {
            const attempt = await ExamAttempt.findByPk(attempt_id);
            return attempt ? attempt.toJSON() : null;
        } catch (error) {
            console.error(`Failed To Fetch Attempt: ${error}`);
            throw new Error(`Error Occurred While Fetching Attempt: ${error}`);
        }
    },

    submit: async (attempt_id, end_time, score) => {
        try {
            const [result] = await ExamAttempt.update(
                {
                    end_time: end_time || new Date(),
                    score: score
                },
                { where: { attempt_id } }
            );
            return result;
        } catch (error) {
            console.error(`Exam Attempt Submit Error: ${error}`);
            throw new Error(`Error Occurred While Submitting Exam Attempt: ${error}`);
        }
    }
};

export default ExamAttempt;