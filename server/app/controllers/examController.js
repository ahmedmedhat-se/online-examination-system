import { ExamModel } from "../models/Exam.js";

export const examController = {
    create: async (req, res) => {
        try {
            const instructorId = req.user.user_role === 'instructor'
                ? req.user.instructor_id
                : req.body.instructor_id;

            if (!instructorId) {
                return res.status(400).json({ success: false, message: "Instructor ID is required" });
            }

            const examId = await ExamModel.create({ ...req.body, instructor_id: instructorId });
            const exam = await ExamModel.readById(examId);
            return res.status(201).json({ success: true, message: "Exam created", data: { exam } });
        } catch (error) {
            console.error(`Exam creation error: ${error.message}`);
            return res.status(500).json({ success: false, message: "Internal server error" });
        }
    },

    getAll: async (req, res) => {
        try {
            const exams = await ExamModel.readAll();
            return res.status(200).json({ success: true, data: { exams } });
        } catch (error) {
            console.error(`Get exams error: ${error.message}`);
            return res.status(500).json({ success: false, message: "Internal server error" });
        }
    },

    getById: async (req, res) => {
        try {
            const exam = await ExamModel.readById(req.params.id);
            if (!exam) return res.status(404).json({ success: false, message: "Exam not found" });
            return res.status(200).json({ success: true, data: { exam } });
        } catch (error) {
            console.error(`Get exam error: ${error.message}`);
            return res.status(500).json({ success: false, message: "Internal server error" });
        }
    },

    getByInstructor: async (req, res) => {
        try {
            const exams = await ExamModel.readByInstructorId(req.user.instructor_id);
            return res.status(200).json({ success: true, data: { exams } });
        } catch (error) {
            console.error(`Get instructor exams error: ${error.message}`);
            return res.status(500).json({ success: false, message: "Internal server error" });
        }
    },

    getByCourse: async (req, res) => {
        try {
            const exams = await ExamModel.readByCourseId(req.params.courseId);
            return res.status(200).json({ success: true, data: { exams } });
        } catch (error) {
            console.error(`Get course exams error: ${error.message}`);
            return res.status(500).json({ success: false, message: "Internal server error" });
        }
    },

    update: async (req, res) => {
        try {
            const affected = await ExamModel.update(req.params.id, req.body);
            if (!affected) return res.status(404).json({ success: false, message: "Exam not found" });
            const exam = await ExamModel.readById(req.params.id);
            return res.status(200).json({ success: true, message: "Exam updated", data: { exam } });
        } catch (error) {
            console.error(`Update exam error: ${error.message}`);
            return res.status(500).json({ success: false, message: "Internal server error" });
        }
    },

    delete: async (req, res) => {
        try {
            const affected = await ExamModel.delete(req.params.id);
            if (!affected) return res.status(404).json({ success: false, message: "Exam not found" });
            return res.status(200).json({ success: true, message: "Exam deleted" });
        } catch (error) {
            console.error(`Delete exam error: ${error.message}`);
            return res.status(500).json({ success: false, message: "Internal server error" });
        }
    },

    enrollStudent: async (req, res) => {
        try {
            await ExamModel.enrollStudent(req.params.id, req.body.student_id);
            return res.status(201).json({ success: true, message: "Student enrolled" });
        } catch (error) {
            console.error(`Enroll student error: ${error.message}`);
            return res.status(500).json({ success: false, message: "Internal server error" });
        }
    },

    getEnrolledStudents: async (req, res) => {
        try {
            const students = await ExamModel.getEnrolledStudents(req.params.id);
            return res.status(200).json({ success: true, data: { students } });
        } catch (error) {
            console.error(`Get enrolled students error: ${error.message}`);
            return res.status(500).json({ success: false, message: "Internal server error" });
        }
    },

    getStudentExams: async (req, res) => {
        try {
            const exams = await ExamModel.getStudentExams(req.user.student_id);
            return res.status(200).json({ success: true, data: { exams } });
        } catch (error) {
            console.error(`Get student exams error: ${error.message}`);
            return res.status(500).json({ success: false, message: "Internal server error" });
        }
    },
};