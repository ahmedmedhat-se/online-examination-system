import ExamAttempt from "../models/ExamAttempt.js";
import StudentAnswer from "../models/StudentAnswer.js";

export const examAttemptController = {
    startExam: async (req, res) => {
        try {
            const attemptId = await ExamAttempt.create({
                student_id: req.user.student_id,
                exam_id: req.body.exam_id,
            });
            const attempt = await ExamAttempt.readById(attemptId);
            return res.status(201).json({ success: true, message: "Exam attempt started", data: { attempt } });
        } catch (error) {
            console.error(`Start exam error: ${error.message}`);
            return res.status(500).json({ success: false, message: "Internal server error" });
        }
    },

    submitExam: async (req, res) => {
        try {
            const { attempt_id, answers, score } = req.body;

            for (const answer of answers) {
                await StudentAnswer.create({
                    attempt_id,
                    question_id: answer.question_id,
                    given_answer: answer.given_answer,
                    marks_obtained: answer.marks_obtained || 0,
                });
            }

            await ExamAttempt.submit(attempt_id, new Date(), score);
            const attempt = await ExamAttempt.readById(attempt_id);
            const studentAnswers = await StudentAnswer.readByAttemptId(attempt_id);

            return res.status(200).json({ success: true, message: "Exam submitted", data: { attempt, answers: studentAnswers } });
        } catch (error) {
            console.error(`Submit exam error: ${error.message}`);
            return res.status(500).json({ success: false, message: "Internal server error" });
        }
    },

    getStudentAttempts: async (req, res) => {
        try {
            const attempts = await ExamAttempt.readByStudentId(req.user.student_id);
            return res.status(200).json({ success: true, data: { attempts } });
        } catch (error) {
            console.error(`Get student attempts error: ${error.message}`);
            return res.status(500).json({ success: false, message: "Internal server error" });
        }
    },

    getExamAttempts: async (req, res) => {
        try {
            const attempts = await ExamAttempt.readByExamId(req.params.examId);
            return res.status(200).json({ success: true, data: { attempts } });
        } catch (error) {
            console.error(`Get exam attempts error: ${error.message}`);
            return res.status(500).json({ success: false, message: "Internal server error" });
        }
    },

    getAttemptById: async (req, res) => {
        try {
            const attempt = await ExamAttempt.readById(req.params.id);
            if (!attempt) return res.status(404).json({ success: false, message: "Attempt not found" });
            const answers = await StudentAnswer.readByAttemptId(req.params.id);
            return res.status(200).json({ success: true, data: { attempt, answers } });
        } catch (error) {
            console.error(`Get attempt error: ${error.message}`);
            return res.status(500).json({ success: false, message: "Internal server error" });
        }
    },
};