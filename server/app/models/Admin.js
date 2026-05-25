import { DataTypes } from "sequelize";
import { sequelize } from "../../database/mysql.js";
import User from "./User.js";

const Admin = sequelize.define('Admin', {
    admin_id: {
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
    access_level: {
        type: DataTypes.STRING,
        defaultValue: 'full'
    }
}, {
    tableName: 'admins',
    timestamps: false
});

Admin.belongsTo(User, { foreignKey: 'user_id' });

export const AdminModel = {
    create: async (admin) => {
        try {
            const result = await Admin.create({
                user_id: admin.user_id,
                access_level: admin.access_level || 'full'
            });
            return result.admin_id;
        } catch (error) {
            throw new Error(`Failed to create admin: ${error.message}`);
        }
    },

    readById: async (admin_id) => {
        try {
            const admin = await Admin.findByPk(admin_id, {
                include: [{
                    model: User,
                    attributes: ['first_name', 'last_name', 'email', 'is_active']
                }]
            });
            if (!admin) return null;
            const adminJson = admin.toJSON();
            return {
                ...adminJson,
                first_name: adminJson.User?.first_name,
                last_name: adminJson.User?.last_name,
                email: adminJson.User?.email,
                is_active: adminJson.User?.is_active,
                User: undefined
            };
        } catch (error) {
            throw new Error(`Failed to fetch admin: ${error.message}`);
        }
    },

    readByUserId: async (user_id) => {
        try {
            const admin = await Admin.findOne({
                where: { user_id },
                include: [{
                    model: User,
                    attributes: ['first_name', 'last_name', 'email', 'is_active']
                }]
            });
            if (!admin) return null;
            const adminJson = admin.toJSON();
            return {
                ...adminJson,
                first_name: adminJson.User?.first_name,
                last_name: adminJson.User?.last_name,
                email: adminJson.User?.email,
                is_active: adminJson.User?.is_active,
                User: undefined
            };
        } catch (error) {
            throw new Error(`Failed to fetch admin by user: ${error.message}`);
        }
    },

    readAll: async () => {
        try {
            const admins = await Admin.findAll({
                include: [{
                    model: User,
                    where: { is_active: true },
                    attributes: ['first_name', 'last_name', 'email', 'is_active', 'last_login']
                }],
                order: [[User, 'first_name', 'ASC']]
            });
            return admins.map(a => {
                const adminJson = a.toJSON();
                return {
                    ...adminJson,
                    first_name: adminJson.User?.first_name,
                    last_name: adminJson.User?.last_name,
                    email: adminJson.User?.email,
                    is_active: adminJson.User?.is_active,
                    last_login: adminJson.User?.last_login,
                    User: undefined
                };
            });
        } catch (error) {
            throw new Error(`Failed to fetch admins: ${error.message}`);
        }
    },

    update: async (admin_id, updates) => {
        try {
            const updateData = {};
            if (updates.access_level !== undefined) updateData.access_level = updates.access_level;
            
            if (Object.keys(updateData).length === 0) throw new Error("No fields to update");
            
            const [result] = await Admin.update(updateData, {
                where: { admin_id }
            });
            return result;
        } catch (error) {
            throw new Error(`Failed to update admin: ${error.message}`);
        }
    },

    delete: async (admin_id) => {
        try {
            const result = await Admin.destroy({
                where: { admin_id }
            });
            return result;
        } catch (error) {
            throw new Error(`Failed to delete admin: ${error.message}`);
        }
    },

    readStats: async () => {
        try {
            const [userCount] = await sequelize.query(`SELECT COUNT(*) as total FROM users WHERE is_active = TRUE`);
            const [studentCount] = await sequelize.query(`SELECT COUNT(*) as total FROM students`);
            const [instructorCount] = await sequelize.query(`SELECT COUNT(*) as total FROM instructors`);
            const [examCount] = await sequelize.query(`SELECT COUNT(*) as total FROM exams`);
            const [courseCount] = await sequelize.query(`SELECT COUNT(*) as total FROM courses`);
            return {
                users: userCount[0].total,
                students: studentCount[0].total,
                instructors: instructorCount[0].total,
                exams: examCount[0].total,
                courses: courseCount[0].total
            };
        } catch (error) {
            throw new Error(`Failed to fetch stats: ${error.message}`);
        }
    }
};

export default Admin;