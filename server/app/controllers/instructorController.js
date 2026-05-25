import Instructor from "../models/Instructor.js";
import User from "../models/User.js";
import Exam from "../models/Exam.js";
import Question from "../models/Question.js";

export const instructorController = {
    getProfile: async (req, res) => {
        try {
            const instructor = await Instructor.readByUserId(req.user.user_id);
            if (!instructor) return res.status(404).json({ message: "Instructor profile not found", success: false });
            const { password_hash: _, ...userData } = await User.readUserById(req.user.user_id);
            return res.status(200).json({ message: "Profile fetched", success: true, data: { instructor: { ...instructor, ...userData } } });
        } catch (error) {
            return res.status(500).json({ message: error.message, success: false });
        }
    },

    updateProfile: async (req, res) => {
        try {
            const instructor = await Instructor.readByUserId(req.user.user_id);
            if (!instructor) return res.status(404).json({ message: "Instructor not found", success: false });
            const { department, office } = req.body;
            const affected = await Instructor.update(instructor.instructor_id, { department, office });
            if (!affected) return res.status(400).json({ message: "No changes made", success: false });
            const updated = await Instructor.readById(instructor.instructor_id);
            return res.status(200).json({ message: "Profile updated", success: true, data: { instructor: updated } });
        } catch (error) {
            return res.status(500).json({ message: error.message, success: false });
        }
    },

    getCourses: async (req, res) => {
        try {
            const instructor = await Instructor.readByUserId(req.user.user_id);
            if (!instructor) return res.status(404).json({ message: "Instructor not found", success: false });
            const courses = await Instructor.readCourses(instructor.instructor_id);
            return res.status(200).json({ message: "Courses fetched", success: true, data: { courses } });
        } catch (error) {
            return res.status(500).json({ message: error.message, success: false });
        }
    },

    getExams: async (req, res) => {
        try {
            const instructor = await Instructor.readByUserId(req.user.user_id);
            if (!instructor) return res.status(404).json({ message: "Instructor not found", success: false });
            const exams = await Exam.readByInstructorId(instructor.instructor_id);
            return res.status(200).json({ message: "Exams fetched", success: true, data: { exams } });
        } catch (error) {
            return res.status(500).json({ message: error.message, success: false });
        }
    },

    createExam: async (req, res) => {
        try {
            const instructor = await Instructor.readByUserId(req.user.user_id);
            if (!instructor) return res.status(404).json({ message: "Instructor not found", success: false });
            
            const { 
                title, 
                description, 
                duration_minutes, 
                total_marks, 
                passing_marks, 
                course_id, 
                is_published,
                start_time,
                end_time,
                category_id
            } = req.body;
            
            const examData = {
                title,
                description: description || null,
                duration_minutes,
                total_marks,
                passing_marks,
                start_time: start_time || null,
                end_time: end_time || null,
                course_id,
                category_id: category_id || null,
                instructor_id: instructor.instructor_id,
                is_published: is_published || false
            };
            
            const examId = await Exam.create(examData);
            const newExam = await Exam.readById(examId);
            
            return res.status(201).json({ 
                message: "Exam created successfully", 
                success: true, 
                data: { exam: newExam } 
            });
        } catch (error) {
            console.error('Create exam error:', error);
            return res.status(500).json({ message: error.message, success: false });
        }
    },

    updateExam: async (req, res) => {
        try {
            const { id } = req.params;
            const exam = await Exam.readById(id);
            
            if (!exam) return res.status(404).json({ message: "Exam not found", success: false });
            
            const instructor = await Instructor.readByUserId(req.user.user_id);
            if (exam.instructor_id !== instructor.instructor_id) {
                return res.status(403).json({ message: "Unauthorized to update this exam", success: false });
            }
            
            const { 
                title, 
                description, 
                duration_minutes, 
                total_marks, 
                passing_marks, 
                course_id, 
                is_published,
                start_time,
                end_time,
                category_id
            } = req.body;
            
            const updated = await Exam.update(id, {
                title,
                description,
                duration_minutes,
                total_marks,
                passing_marks,
                course_id,
                is_published,
                start_time,
                end_time,
                category_id
            });
            
            if (!updated) return res.status(400).json({ message: "No changes made", success: false });
            
            const updatedExam = await Exam.readById(id);
            return res.status(200).json({ 
                message: "Exam updated successfully", 
                success: true, 
                data: { exam: updatedExam } 
            });
        } catch (error) {
            return res.status(500).json({ message: error.message, success: false });
        }
    },

    deleteExam: async (req, res) => {
        try {
            const { id } = req.params;
            const exam = await Exam.readById(id);
            
            if (!exam) return res.status(404).json({ message: "Exam not found", success: false });
            
            const instructor = await Instructor.readByUserId(req.user.user_id);
            if (exam.instructor_id !== instructor.instructor_id) {
                return res.status(403).json({ message: "Unauthorized to delete this exam", success: false });
            }
            
            await Question.deleteByExamId(id);
            await Exam.delete(id);
            
            return res.status(200).json({ message: "Exam deleted successfully", success: true });
        } catch (error) {
            return res.status(500).json({ message: error.message, success: false });
        }
    },

    getQuestions: async (req, res) => {
        try {
            const { examId } = req.params;
            const exam = await Exam.readById(examId);
            
            if (!exam) return res.status(404).json({ message: "Exam not found", success: false });
            
            const instructor = await Instructor.readByUserId(req.user.user_id);
            if (exam.instructor_id !== instructor.instructor_id) {
                return res.status(403).json({ message: "Unauthorized to view these questions", success: false });
            }
            
            const questions = await Question.readByExamId(examId);
            return res.status(200).json({ 
                message: "Questions fetched", 
                success: true, 
                data: { questions } 
            });
        } catch (error) {
            return res.status(500).json({ message: error.message, success: false });
        }
    },

    createQuestion: async (req, res) => {
        try {
            const { examId } = req.params;
            const exam = await Exam.readById(examId);
            
            if (!exam) return res.status(404).json({ message: "Exam not found", success: false });
            
            const instructor = await Instructor.readByUserId(req.user.user_id);
            if (exam.instructor_id !== instructor.instructor_id) {
                return res.status(403).json({ message: "Unauthorized to add questions to this exam", success: false });
            }
            
            const { question_text, question_type, options, correct_answer, marks } = req.body;
            
            const questionData = {
                exam_id: parseInt(examId),
                question_text,
                question_type,
                options: options ? JSON.stringify(options) : null,
                correct_answer,
                marks
            };
            
            const questionId = await Question.create(questionData);
            const newQuestion = await Question.readById(questionId);
            
            return res.status(201).json({ 
                message: "Question created successfully", 
                success: true, 
                data: { question: newQuestion } 
            });
        } catch (error) {
            console.error('Create question error:', error);
            return res.status(500).json({ message: error.message, success: false });
        }
    },

    updateQuestion: async (req, res) => {
        try {
            const { id } = req.params;
            const question = await Question.readById(id);
            
            if (!question) return res.status(404).json({ message: "Question not found", success: false });
            
            const exam = await Exam.readById(question.exam_id);
            const instructor = await Instructor.readByUserId(req.user.user_id);
            
            if (exam.instructor_id !== instructor.instructor_id) {
                return res.status(403).json({ message: "Unauthorized to update this question", success: false });
            }
            
            const { question_text, question_type, options, correct_answer, marks } = req.body;
            
            const updated = await Question.update(id, {
                question_text,
                question_type,
                options: options ? JSON.stringify(options) : null,
                correct_answer,
                marks
            });
            
            if (!updated) return res.status(400).json({ message: "No changes made", success: false });
            
            const updatedQuestion = await Question.readById(id);
            return res.status(200).json({ 
                message: "Question updated successfully", 
                success: true, 
                data: { question: updatedQuestion } 
            });
        } catch (error) {
            return res.status(500).json({ message: error.message, success: false });
        }
    },

    deleteQuestion: async (req, res) => {
        try {
            const { id } = req.params;
            const question = await Question.readById(id);
            
            if (!question) return res.status(404).json({ message: "Question not found", success: false });
            
            const exam = await Exam.readById(question.exam_id);
            const instructor = await Instructor.readByUserId(req.user.user_id);
            
            if (exam.instructor_id !== instructor.instructor_id) {
                return res.status(403).json({ message: "Unauthorized to delete this question", success: false });
            }
            
            await Question.delete(id);
            return res.status(200).json({ message: "Question deleted successfully", success: true });
        } catch (error) {
            return res.status(500).json({ message: error.message, success: false });
        }
    },

    getExamStudents: async (req, res) => {
        try {
            const { examId } = req.params;
            const exam = await Exam.readById(examId);
            
            if (!exam) return res.status(404).json({ message: "Exam not found", success: false });
            
            const instructor = await Instructor.readByUserId(req.user.user_id);
            if (exam.instructor_id !== instructor.instructor_id) {
                return res.status(403).json({ message: "Unauthorized to view students for this exam", success: false });
            }
            
            const students = await Exam.getEnrolledStudents(examId);
            return res.status(200).json({ 
                message: "Students fetched", 
                success: true, 
                data: { students } 
            });
        } catch (error) {
            return res.status(500).json({ message: error.message, success: false });
        }
    }
};