import { DataTypes } from "sequelize";
import { sequelize } from "../../database/mysql.js";
import User from "./User.js";

const Instructor = sequelize.define('Instructor', {
    instructor_id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    user_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'users',
            key: 'user_id'
        }
    },
    department: {
        type: DataTypes.STRING,
        allowNull: true
    },
    office: {
        type: DataTypes.STRING,
        allowNull: true
    }
}, {
    tableName: 'instructors',
    timestamps: false
});

Instructor.belongsTo(User, { foreignKey: 'user_id' });

export const InstructorModel = {
    create: async (instructor) => {
        try {
            const result = await Instructor.create({
                user_id: instructor.user_id,
                department: instructor.department || null,
                office: instructor.office || null
            });
            return result.instructor_id;
        } catch (error) {
            throw new Error(`Failed to create instructor: ${error.message}`);
        }
    },

    readById: async (instructor_id) => {
        try {
            const instructor = await Instructor.findByPk(instructor_id, {
                include: [{
                    model: User,
                    attributes: ['first_name', 'last_name', 'email', 'is_active']
                }]
            });
            if (!instructor) return null;
            const instructorJson = instructor.toJSON();
            return {
                ...instructorJson,
                first_name: instructorJson.User?.first_name,
                last_name: instructorJson.User?.last_name,
                email: instructorJson.User?.email,
                is_active: instructorJson.User?.is_active,
                User: undefined
            };
        } catch (error) {
            throw new Error(`Failed to fetch instructor: ${error.message}`);
        }
    },

    readByUserId: async (user_id) => {
        try {
            const instructor = await Instructor.findOne({
                where: { user_id },
                include: [{
                    model: User,
                    attributes: ['first_name', 'last_name', 'email', 'is_active']
                }]
            });
            if (!instructor) return null;
            const instructorJson = instructor.toJSON();
            return {
                ...instructorJson,
                first_name: instructorJson.User?.first_name,
                last_name: instructorJson.User?.last_name,
                email: instructorJson.User?.email,
                is_active: instructorJson.User?.is_active,
                User: undefined
            };
        } catch (error) {
            throw new Error(`Failed to fetch instructor by user: ${error.message}`);
        }
    },

    readAll: async () => {
        try {
            const instructors = await Instructor.findAll({
                include: [{
                    model: User,
                    where: { is_active: true },
                    attributes: ['first_name', 'last_name', 'email', 'is_active', 'last_login']
                }],
                order: [[User, 'first_name', 'ASC']]
            });
            return instructors.map(i => {
                const instructorJson = i.toJSON();
                return {
                    ...instructorJson,
                    first_name: instructorJson.User?.first_name,
                    last_name: instructorJson.User?.last_name,
                    email: instructorJson.User?.email,
                    is_active: instructorJson.User?.is_active,
                    last_login: instructorJson.User?.last_login,
                    User: undefined
                };
            });
        } catch (error) {
            throw new Error(`Failed to fetch instructors: ${error.message}`);
        }
    },

    update: async (instructor_id, updates) => {
        try {
            const updateData = {};
            if (updates.department !== undefined) updateData.department = updates.department;
            if (updates.office !== undefined) updateData.office = updates.office;
            
            if (Object.keys(updateData).length === 0) throw new Error("No fields to update");
            
            const [result] = await Instructor.update(updateData, {
                where: { instructor_id }
            });
            return result;
        } catch (error) {
            throw new Error(`Failed to update instructor: ${error.message}`);
        }
    },

    delete: async (instructor_id) => {
        try {
            const result = await Instructor.destroy({
                where: { instructor_id }
            });
            return result;
        } catch (error) {
            throw new Error(`Failed to delete instructor: ${error.message}`);
        }
    },

    readCourses: async (instructor_id) => {
        try {
            const [rows] = await sequelize.query(`
                SELECT c.* FROM courses c 
                JOIN course_instructors ci ON c.course_id = ci.course_id 
                WHERE ci.instructor_id = ?
            `, { replacements: [instructor_id] });
            return rows;
        } catch (error) {
            throw new Error(`Failed to fetch instructor courses: ${error.message}`);
        }
    },

    readExams: async (instructor_id) => {
        try {
            const [rows] = await sequelize.query(`
                SELECT e.*, c.course_name, cat.category_name 
                FROM exams e 
                JOIN courses c ON e.course_id = c.course_id 
                LEFT JOIN categories cat ON e.category_id = cat.category_id 
                WHERE e.instructor_id = ? 
                ORDER BY e.created_at DESC
            `, { replacements: [instructor_id] });
            return rows;
        } catch (error) {
            throw new Error(`Failed to fetch instructor exams: ${error.message}`);
        }
    }
};

export default Instructor;