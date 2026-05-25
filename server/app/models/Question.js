import { DataTypes } from "sequelize";
import { sequelize } from "../../database/mysql.js";

const Question = sequelize.define('Question', {
    question_id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    exam_id: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    question_text: {
        type: DataTypes.TEXT,
        allowNull: false
    },
    question_type: {
        type: DataTypes.ENUM('multiple_choice', 'true_false', 'essay'),
        allowNull: false
    },
    options: {
        type: DataTypes.TEXT,
        allowNull: true,
        get() {
            const rawValue = this.getDataValue('options');
            if (!rawValue) return null;
            try {
                return JSON.parse(rawValue);
            } catch (e) {
                return rawValue;
            }
        },
        set(value) {
            if (value && typeof value === 'object') {
                this.setDataValue('options', JSON.stringify(value));
            } else {
                this.setDataValue('options', value);
            }
        }
    },
    correct_answer: {
        type: DataTypes.TEXT,
        allowNull: false
    },
    marks: {
        type: DataTypes.INTEGER,
        allowNull: false
    }
}, {
    tableName: 'questions',
    timestamps: false
});

export const QuestionModel = {
    create: async (question) => {
        try {
            const result = await Question.create({
                exam_id: question.exam_id,
                question_text: question.question_text,
                question_type: question.question_type,
                options: question.options,
                correct_answer: question.correct_answer,
                marks: question.marks
            });
            return result.question_id;
        } catch (error) {
            console.error(`Question Creation Error: ${error}`);
            throw new Error(`Error Occurred While Creating Question: ${error}`);
        }
    },

    readById: async (question_id) => {
        try {
            const question = await Question.findByPk(question_id);
            return question ? question.toJSON() : null;
        } catch (error) {
            console.error(`Failed To Fetch Question: ${error}`);
            throw new Error(`Error Occurred While Fetching Question: ${error}`);
        }
    },

    readByExamId: async (exam_id) => {
        try {
            const questions = await Question.findAll({
                where: { exam_id },
                order: [['question_id', 'ASC']]
            });
            return questions.map(q => q.toJSON());
        } catch (error) {
            console.error(`Failed To Fetch Exam Questions: ${error}`);
            throw new Error(`Error Occurred While Fetching Exam Questions: ${error}`);
        }
    },

    update: async (question_id, updates) => {
        try {
            const updateData = {};
            const allowedFields = ["question_text", "question_type", "options", "correct_answer", "marks"];
            allowedFields.forEach(field => {
                if (updates[field] !== undefined) updateData[field] = updates[field];
            });
            
            if (Object.keys(updateData).length === 0) throw new Error("No fields to update");
            
            const [result] = await Question.update(updateData, {
                where: { question_id }
            });
            return result;
        } catch (error) {
            console.error(`Question Update Error: ${error}`);
            throw new Error(`Error Occurred While Updating Question: ${error}`);
        }
    },

    delete: async (question_id) => {
        try {
            const result = await Question.destroy({
                where: { question_id }
            });
            return result;
        } catch (error) {
            console.error(`Question Deletion Error: ${error}`);
            throw new Error(`Error Occurred While Deleting Question: ${error}`);
        }
    },

    deleteByExamId: async (exam_id) => {
        try {
            const result = await Question.destroy({
                where: { exam_id }
            });
            return result;
        } catch (error) {
            console.error(`Questions Deletion Error: ${error}`);
            throw new Error(`Error Occurred While Deleting Exam Questions: ${error}`);
        }
    }
};

export default Question;