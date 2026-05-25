import { DataTypes } from "sequelize";
import { sequelize } from "../../database/mysql.js";

const Category = sequelize.define('Category', {
    category_id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    category_name: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
    },
    description: {
        type: DataTypes.TEXT,
        allowNull: true
    }
}, {
    tableName: 'categories',
    timestamps: false
});

export const CategoryModel = {
    create: async (category) => {
        try {
            const result = await Category.create({
                category_name: category.category_name,
                description: category.description || null
            });
            return result.category_id;
        } catch (error) {
            console.error(`Category Creation Error: ${error}`);
            throw new Error(`Error Occurred While Creating Category: ${error}`);
        }
    },

    readAll: async () => {
        try {
            const categories = await Category.findAll({
                order: [['category_name', 'ASC']]
            });
            return categories.map(c => c.toJSON());
        } catch (error) {
            console.error(`Failed To Fetch Categories: ${error}`);
            throw new Error(`Error Occurred While Fetching Categories: ${error}`);
        }
    },

    readById: async (category_id) => {
        try {
            const category = await Category.findByPk(category_id);
            return category ? category.toJSON() : null;
        } catch (error) {
            console.error(`Failed To Fetch Category: ${error}`);
            throw new Error(`Error Occurred While Fetching Category: ${error}`);
        }
    },

    update: async (category_id, updates) => {
        try {
            const updateData = {};
            if (updates.category_name !== undefined) updateData.category_name = updates.category_name;
            if (updates.description !== undefined) updateData.description = updates.description;
            
            if (Object.keys(updateData).length === 0) throw new Error("No fields to update");
            
            const [result] = await Category.update(updateData, {
                where: { category_id }
            });
            return result;
        } catch (error) {
            console.error(`Category Update Error: ${error}`);
            throw new Error(`Error Occurred While Updating Category: ${error}`);
        }
    },

    delete: async (category_id) => {
        try {
            const result = await Category.destroy({
                where: { category_id }
            });
            return result;
        } catch (error) {
            console.error(`Category Deletion Error: ${error}`);
            throw new Error(`Error Occurred While Deleting Category: ${error}`);
        }
    }
};

export default Category;