import { db_config } from "../../database/mysql.js";

export const Category = {
    create: async (category) => {
        try {
            const [result] = await db_config.query(
                "INSERT INTO categories (category_name, description) VALUES (?, ?)",
                [category.category_name, category.description || null]
            );
            return result.insertId;
        } catch (error) {
            console.error(`Category Creation Error: ${error}`);
            throw new Error(`Error Occurred While Creating Category: ${error}`);
        }
    },

    readAll: async () => {
        try {
            const [categories] = await db_config.query("SELECT * FROM categories ORDER BY category_name ASC");
            return categories;
        } catch (error) {
            console.error(`Failed To Fetch Categories: ${error}`);
            throw new Error(`Error Occurred While Fetching Categories: ${error}`);
        }
    },

    readById: async (category_id) => {
        try {
            const [category] = await db_config.query("SELECT * FROM categories WHERE category_id = ?", [category_id]);
            return category[0] || null;
        } catch (error) {
            console.error(`Failed To Fetch Category: ${error}`);
            throw new Error(`Error Occurred While Fetching Category: ${error}`);
        }
    },

    update: async (category_id, updates) => {
        try {
            const fields = [];
            const values = [];
            if (updates.category_name !== undefined) { fields.push("category_name = ?"); values.push(updates.category_name); }
            if (updates.description !== undefined) { fields.push("description = ?"); values.push(updates.description); }
            if (fields.length === 0) throw new Error("No fields to update");
            values.push(category_id);
            const [result] = await db_config.query(`UPDATE categories SET ${fields.join(", ")} WHERE category_id = ?`, values);
            return result.affectedRows;
        } catch (error) {
            console.error(`Category Update Error: ${error}`);
            throw new Error(`Error Occurred While Updating Category: ${error}`);
        }
    },

    delete: async (category_id) => {
        try {
            const [result] = await db_config.query("DELETE FROM categories WHERE category_id = ?", [category_id]);
            return result.affectedRows;
        } catch (error) {
            console.error(`Category Deletion Error: ${error}`);
            throw new Error(`Error Occurred While Deleting Category: ${error}`);
        }
    },
};