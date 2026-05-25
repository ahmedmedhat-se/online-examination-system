import { DataTypes } from "sequelize";
import { sequelize } from "../../database/mysql.js";
import User from "./User.js";

const Student = sequelize.define('Student', {
    student_id: {
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
    phone: {
        type: DataTypes.STRING,
        allowNull: true
    },
    address_street: {
        type: DataTypes.STRING,
        allowNull: true
    },
    address_city: {
        type: DataTypes.STRING,
        allowNull: true
    },
    address_zip: {
        type: DataTypes.STRING,
        allowNull: true
    }
}, {
    tableName: 'students',
    timestamps: false
});

Student.belongsTo(User, { foreignKey: 'user_id' });

export const StudentModel = {
    create: async (student) => {
        try {
            const result = await Student.create({
                user_id: student.user_id,
                phone: student.phone || null,
                address_street: student.address_street || null,
                address_city: student.address_city || null,
                address_zip: student.address_zip || null
            });
            return result.student_id;
        } catch (error) {
            throw new Error(`Failed to create student: ${error.message}`);
        }
    },

    readById: async (student_id) => {
        try {
            const student = await Student.findByPk(student_id, {
                include: [{
                    model: User,
                    attributes: ['first_name', 'last_name', 'email', 'is_active']
                }]
            });
            if (!student) return null;
            const studentJson = student.toJSON();
            return {
                ...studentJson,
                first_name: studentJson.User?.first_name,
                last_name: studentJson.User?.last_name,
                email: studentJson.User?.email,
                is_active: studentJson.User?.is_active,
                User: undefined
            };
        } catch (error) {
            throw new Error(`Failed to fetch student: ${error.message}`);
        }
    },

    readByUserId: async (user_id) => {
        try {
            const student = await Student.findOne({
                where: { user_id },
                include: [{
                    model: User,
                    attributes: ['first_name', 'last_name', 'email', 'is_active']
                }]
            });
            if (!student) return null;
            const studentJson = student.toJSON();
            return {
                ...studentJson,
                first_name: studentJson.User?.first_name,
                last_name: studentJson.User?.last_name,
                email: studentJson.User?.email,
                is_active: studentJson.User?.is_active,
                User: undefined
            };
        } catch (error) {
            throw new Error(`Failed to fetch student by user: ${error.message}`);
        }
    },

    readAll: async () => {
        try {
            const students = await Student.findAll({
                include: [{
                    model: User,
                    where: { is_active: true },
                    attributes: ['first_name', 'last_name', 'email', 'is_active', 'last_login']
                }],
                order: [[User, 'first_name', 'ASC']]
            });
            return students.map(s => {
                const studentJson = s.toJSON();
                return {
                    ...studentJson,
                    first_name: studentJson.User?.first_name,
                    last_name: studentJson.User?.last_name,
                    email: studentJson.User?.email,
                    is_active: studentJson.User?.is_active,
                    last_login: studentJson.User?.last_login,
                    User: undefined
                };
            });
        } catch (error) {
            throw new Error(`Failed to fetch students: ${error.message}`);
        }
    },

    update: async (student_id, updates) => {
        try {
            const updateData = {};
            if (updates.phone !== undefined) updateData.phone = updates.phone;
            if (updates.address_street !== undefined) updateData.address_street = updates.address_street;
            if (updates.address_city !== undefined) updateData.address_city = updates.address_city;
            if (updates.address_zip !== undefined) updateData.address_zip = updates.address_zip;
            
            if (Object.keys(updateData).length === 0) throw new Error("No fields to update");
            
            const [result] = await Student.update(updateData, {
                where: { student_id }
            });
            return result;
        } catch (error) {
            throw new Error(`Failed to update student: ${error.message}`);
        }
    },

    delete: async (student_id) => {
        try {
            const result = await Student.destroy({
                where: { student_id }
            });
            return result;
        } catch (error) {
            throw new Error(`Failed to delete student: ${error.message}`);
        }
    },

    readEnrollments: async (student_id) => {
        try {
            const [rows] = await sequelize.query(`
                SELECT e.*, ex.title, ex.duration_minutes, ex.total_marks, ex.passing_marks, ex.start_time, ex.end_time, c.course_name 
                FROM exam_enrollments e 
                JOIN exams ex ON e.exam_id = ex.exam_id 
                JOIN courses c ON ex.course_id = c.course_id 
                WHERE e.student_id = ? 
                ORDER BY ex.start_time DESC
            `, { replacements: [student_id] });
            return rows;
        } catch (error) {
            throw new Error(`Failed to fetch enrollments: ${error.message}`);
        }
    },

    readAttempts: async (student_id) => {
        try {
            const [rows] = await sequelize.query(`
                SELECT ea.*, ex.title, ex.total_marks, ex.passing_marks 
                FROM exam_attempts ea 
                JOIN exams ex ON ea.exam_id = ex.exam_id 
                WHERE ea.student_id = ? 
                ORDER BY ea.start_time DESC
            `, { replacements: [student_id] });
            return rows;
        } catch (error) {
            throw new Error(`Failed to fetch attempts: ${error.message}`);
        }
    }
};

export default Student;