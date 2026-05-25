import { CategoryModel } from "../models/Category.js";

export const categoryController = {
    create: async (req, res) => {
        try {
            const categoryId = await CategoryModel.create(req.body);
            const category = await CategoryModel.readById(categoryId);
            return res.status(201).json({ success: true, message: "Category created", data: { category } });
        } catch (error) {
            console.error(`Category creation error: ${error.message}`);
            if (error.message.includes("UNIQUE")) return res.status(409).json({ success: false, message: "Category already exists" });
            return res.status(500).json({ success: false, message: "Internal server error" });
        }
    },

    getAll: async (req, res) => {
        try {
            const categories = await CategoryModel.readAll();
            return res.status(200).json({ success: true, data: { categories } });
        } catch (error) {
            console.error(`Get categories error: ${error.message}`);
            return res.status(500).json({ success: false, message: "Internal server error" });
        }
    },

    getById: async (req, res) => {
        try {
            const category = await CategoryModel.readById(req.params.id);
            if (!category) return res.status(404).json({ success: false, message: "Category not found" });
            return res.status(200).json({ success: true, data: { category } });
        } catch (error) {
            console.error(`Get category error: ${error.message}`);
            return res.status(500).json({ success: false, message: "Internal server error" });
        }
    },

    update: async (req, res) => {
        try {
            const affected = await CategoryModel.update(req.params.id, req.body);
            if (!affected) return res.status(404).json({ success: false, message: "Category not found" });
            const category = await CategoryModel.readById(req.params.id);
            return res.status(200).json({ success: true, message: "Category updated", data: { category } });
        } catch (error) {
            console.error(`Update category error: ${error.message}`);
            return res.status(500).json({ success: false, message: "Internal server error" });
        }
    },

    delete: async (req, res) => {
        try {
            const affected = await CategoryModel.delete(req.params.id);
            if (!affected) return res.status(404).json({ success: false, message: "Category not found" });
            return res.status(200).json({ success: true, message: "Category deleted" });
        } catch (error) {
            console.error(`Delete category error: ${error.message}`);
            return res.status(500).json({ success: false, message: "Internal server error" });
        }
    },
};