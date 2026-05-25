import { DataTypes } from "sequelize";
import { sequelize } from "../../database/mysql.js";

const StudentAnswer = sequelize.define('StudentAnswer', {
    answer_id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    attempt_id: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    question_id: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    given_answer: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    marks_obtained: {
        type: DataTypes.INTEGER,
        defaultValue: 0
    }
}, {
    tableName: 'student_answers',
    timestamps: false
});

export const StudentAnswerModel = {
    create: async (answer) => {
        try {
            const result = await StudentAnswer.create({
                attempt_id: answer.attempt_id,
                question_id: answer.question_id,
                given_answer: answer.given_answer,
                marks_obtained: answer.marks_obtained || 0
            });
            return result.answer_id;
        } catch (error) {
            console.error(`Student Answer Creation Error: ${error}`);
            throw new Error(`Error Occurred While Saving Student Answer: ${error}`);
        }
    },

    readByAttemptId: async (attempt_id) => {
        try {
            const [answers] = await sequelize.query(`
                SELECT sa.*, q.question_text, q.question_type, q.correct_answer, q.marks AS question_marks
                FROM student_answers sa
                JOIN questions q ON sa.question_id = q.question_id
                WHERE sa.attempt_id = ?
                ORDER BY q.question_id ASC
            `, { replacements: [attempt_id] });
            return answers;
        } catch (error) {
            console.error(`Failed To Fetch Student Answers: ${error}`);
            throw new Error(`Error Occurred While Fetching Student Answers: ${error}`);
        }
    },

    updateMarks: async (answer_id, marks_obtained) => {
        try {
            const [result] = await StudentAnswer.update(
                { marks_obtained: marks_obtained },
                { where: { answer_id } }
            );
            return result;
        } catch (error) {
            console.error(`Student Answer Update Error: ${error}`);
            throw new Error(`Error Occurred While Updating Student Answer Marks: ${error}`);
        }
    }
};

export default StudentAnswer;