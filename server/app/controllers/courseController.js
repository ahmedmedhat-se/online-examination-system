import { Course } from "../models/Course.js";

export const courseController = {
    create: async (req, res) => {
        try {
            const courseId = await Course.create(req.body);
            const course = await Course.readById(courseId);
            return res.status(201).json({ success: true, message: "Course created successfully", data: { course } });
        } catch (error) {
            console.error(`Course creation error: ${error.message}`);
            if (error.message.includes("UNIQUE")) return res.status(409).json({ success: false, message: "Course code already exists" });
            return res.status(500).json({ success: false, message: "Internal server error" });
        }
    },

    getAll: async (req, res) => {
        try {
            const courses = await Course.readAll();
            return res.status(200).json({ success: true, data: { courses } });
        } catch (error) {
            console.error(`Get courses error: ${error.message}`);
            return res.status(500).json({ success: false, message: "Internal server error" });
        }
    },

    getById: async (req, res) => {
        try {
            const course = await Course.readById(req.params.id);
            if (!course) return res.status(404).json({ success: false, message: "Course not found" });
            const instructors = await Course.getInstructorsByCourseId(req.params.id);
            return res.status(200).json({ success: true, data: { course, instructors } });
        } catch (error) {
            console.error(`Get course error: ${error.message}`);
            return res.status(500).json({ success: false, message: "Internal server error" });
        }
    },

    update: async (req, res) => {
        try {
            const affected = await Course.update(req.params.id, req.body);
            if (!affected) return res.status(404).json({ success: false, message: "Course not found" });
            const course = await Course.readById(req.params.id);
            return res.status(200).json({ success: true, message: "Course updated", data: { course } });
        } catch (error) {
            console.error(`Update course error: ${error.message}`);
            return res.status(500).json({ success: false, message: "Internal server error" });
        }
    },

    delete: async (req, res) => {
        try {
            const affected = await Course.delete(req.params.id);
            if (!affected) return res.status(404).json({ success: false, message: "Course not found" });
            return res.status(200).json({ success: true, message: "Course deleted" });
        } catch (error) {
            console.error(`Delete course error: ${error.message}`);
            return res.status(500).json({ success: false, message: "Internal server error" });
        }
    },

    assignInstructor: async (req, res) => {
        try {
            const { instructor_id } = req.body;
            await Course.assignInstructor(req.params.id, instructor_id);
            return res.status(201).json({ success: true, message: "Instructor assigned to course" });
        } catch (error) {
            console.error(`Assign instructor error: ${error.message}`);
            return res.status(500).json({ success: false, message: "Internal server error" });
        }
    },

    removeInstructor: async (req, res) => {
        try {
            const { instructor_id } = req.body;
            const affected = await Course.removeInstructor(req.params.id, instructor_id);
            if (!affected) return res.status(404).json({ success: false, message: "Assignment not found" });
            return res.status(200).json({ success: true, message: "Instructor removed from course" });
        } catch (error) {
            console.error(`Remove instructor error: ${error.message}`);
            return res.status(500).json({ success: false, message: "Internal server error" });
        }
    },
};