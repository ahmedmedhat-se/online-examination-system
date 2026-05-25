import Exam from "../models/Exam.js";

export const examController = {
    create: async (req, res) => {
        try {
            const instructorId = req.user.user_role === 'instructor'
                ? req.user.instructor_id
                : req.body.instructor_id;

            if (!instructorId) {
                return res.status(400).json({ success: false, message: "Instructor ID is required" });
            }

            const examId = await Exam.create({ ...req.body, instructor_id: instructorId });
            const exam = await Exam.readById(examId);
            return res.status(201).json({ success: true, message: "Exam created", data: { exam } });
        } catch (error) {
            console.error(`Exam creation error: ${error.message}`);
            return res.status(500).json({ success: false, message: "Internal server error" });
        }
    },

    getAll: async (req, res) => {
        try {
            const exams = await Exam.readAll();
            return res.status(200).json({ success: true, data: { exams } });
        } catch (error) {
            console.error(`Get exams error: ${error.message}`);
            return res.status(500).json({ success: false, message: "Internal server error" });
        }
    },

    getById: async (req, res) => {
        try {
            const exam = await Exam.readById(req.params.id);
            if (!exam) return res.status(404).json({ success: false, message: "Exam not found" });
            return res.status(200).json({ success: true, data: { exam } });
        } catch (error) {
            console.error(`Get exam error: ${error.message}`);
            return res.status(500).json({ success: false, message: "Internal server error" });
        }
    },

    getByInstructor: async (req, res) => {
        try {
            const exams = await Exam.readByInstructorId(req.user.instructor_id);
            return res.status(200).json({ success: true, data: { exams } });
        } catch (error) {
            console.error(`Get instructor exams error: ${error.message}`);
            return res.status(500).json({ success: false, message: "Internal server error" });
        }
    },

    getByCourse: async (req, res) => {
        try {
            const exams = await Exam.readByCourseId(req.params.courseId);
            return res.status(200).json({ success: true, data: { exams } });
        } catch (error) {
            console.error(`Get course exams error: ${error.message}`);
            return res.status(500).json({ success: false, message: "Internal server error" });
        }
    },

    update: async (req, res) => {
        try {
            const affected = await Exam.update(req.params.id, req.body);
            if (!affected) return res.status(404).json({ success: false, message: "Exam not found" });
            const exam = await Exam.readById(req.params.id);
            return res.status(200).json({ success: true, message: "Exam updated", data: { exam } });
        } catch (error) {
            console.error(`Update exam error: ${error.message}`);
            return res.status(500).json({ success: false, message: "Internal server error" });
        }
    },

    delete: async (req, res) => {
        try {
            const affected = await Exam.delete(req.params.id);
            if (!affected) return res.status(404).json({ success: false, message: "Exam not found" });
            return res.status(200).json({ success: true, message: "Exam deleted" });
        } catch (error) {
            console.error(`Delete exam error: ${error.message}`);
            return res.status(500).json({ success: false, message: "Internal server error" });
        }
    },

    enrollStudent: async (req, res) => {
        try {
            await Exam.enrollStudent(req.params.id, req.body.student_id);
            return res.status(201).json({ success: true, message: "Student enrolled" });
        } catch (error) {
            console.error(`Enroll student error: ${error.message}`);
            return res.status(500).json({ success: false, message: "Internal server error" });
        }
    },

    getEnrolledStudents: async (req, res) => {
        try {
            const students = await Exam.getEnrolledStudents(req.params.id);
            return res.status(200).json({ success: true, data: { students } });
        } catch (error) {
            console.error(`Get enrolled students error: ${error.message}`);
            return res.status(500).json({ success: false, message: "Internal server error" });
        }
    },

    getStudentExams: async (req, res) => {
        try {
            const exams = await Exam.getStudentExams(req.user.student_id);
            return res.status(200).json({ success: true, data: { exams } });
        } catch (error) {
            console.error(`Get student exams error: ${error.message}`);
            return res.status(500).json({ success: false, message: "Internal server error" });
        }
    },
};