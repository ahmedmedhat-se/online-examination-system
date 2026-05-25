import { QuestionModel } from "../models/Question.js";

export const questionController = {
    create: async (req, res) => {
        try {
            const questionId = await QuestionModel.create(req.body);
            const question = await QuestionModel.readById(questionId);
            return res.status(201).json({ success: true, message: "Question created", data: { question } });
        } catch (error) {
            console.error(`Question creation error: ${error.message}`);
            return res.status(500).json({ success: false, message: "Internal server error" });
        }
    },

    getByExamId: async (req, res) => {
        try {
            const questions = await QuestionModel.readByExamId(req.params.examId);
            return res.status(200).json({ success: true, data: { questions } });
        } catch (error) {
            console.error(`Get questions error: ${error.message}`);
            return res.status(500).json({ success: false, message: "Internal server error" });
        }
    },

    getById: async (req, res) => {
        try {
            const question = await QuestionModel.readById(req.params.id);
            if (!question) return res.status(404).json({ success: false, message: "Question not found" });
            return res.status(200).json({ success: true, data: { question } });
        } catch (error) {
            console.error(`Get question error: ${error.message}`);
            return res.status(500).json({ success: false, message: "Internal server error" });
        }
    },

    update: async (req, res) => {
        try {
            const affected = await QuestionModel.update(req.params.id, req.body);
            if (!affected) return res.status(404).json({ success: false, message: "Question not found" });
            const question = await QuestionModel.readById(req.params.id);
            return res.status(200).json({ success: true, message: "Question updated", data: { question } });
        } catch (error) {
            console.error(`Update question error: ${error.message}`);
            return res.status(500).json({ success: false, message: "Internal server error" });
        }
    },

    delete: async (req, res) => {
        try {
            const affected = await QuestionModel.delete(req.params.id);
            if (!affected) return res.status(404).json({ success: false, message: "Question not found" });
            return res.status(200).json({ success: true, message: "Question deleted" });
        } catch (error) {
            console.error(`Delete question error: ${error.message}`);
            return res.status(500).json({ success: false, message: "Internal server error" });
        }
    },
};