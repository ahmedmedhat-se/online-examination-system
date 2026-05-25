import { DataTypes } from "sequelize";
import { sequelize } from "../../database/mysql.js";

const User = sequelize.define('User', {
    user_id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
    },
    password_hash: {
        type: DataTypes.STRING,
        allowNull: false
    },
    role: {
        type: DataTypes.ENUM('student', 'instructor', 'admin'),
        defaultValue: 'student'
    },
    first_name: {
        type: DataTypes.STRING,
        allowNull: false
    },
    last_name: {
        type: DataTypes.STRING,
        allowNull: false
    },
    last_login: {
        type: DataTypes.DATE,
        allowNull: true
    },
    is_active: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
    },
    created_at: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
    },
    updated_at: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
    }
}, {
    tableName: 'users',
    timestamps: false,
    underscored: true
});

export const UserModel = {
    create: async (user) => {
        try {
            const result = await User.create({
                email: user.email,
                password_hash: user.password_hash,
                role: user.role || "student",
                first_name: user.first_name,
                last_name: user.last_name
            });
            return result.user_id;
        } catch (error) {
            console.error(`User Creation Error: ${error}`);
            throw new Error(`Error Occurred While Creating User: ${error}`);
        }
    },

    readUserById: async (user_id) => {
        try {
            const user = await User.findByPk(user_id, {
                attributes: ['user_id', 'email', 'role', 'first_name', 'last_name', 'last_login', 'is_active', 'created_at', 'updated_at']
            });
            return user ? user.toJSON() : null;
        } catch (error) {
            console.error(`Failed To Fetch User Via ID: ${error}`);
            throw new Error(`Error Occurred While Fetching User Via ID: ${error}`);
        }
    },

    readUserByEmail: async (email) => {
        try {
            const user = await User.findOne({
                where: { email },
                attributes: ['user_id', 'email', 'password_hash', 'role', 'first_name', 'last_name', 'last_login', 'is_active', 'created_at', 'updated_at']
            });
            return user ? user.toJSON() : null;
        } catch (error) {
            console.error(`Failed To Fetch User Via Email: ${error}`);
            throw new Error(`Error Occurred While Fetching User Via Email: ${error}`);
        }
    },

    readAllUsers: async () => {
        try {
            const users = await User.findAll({
                where: { is_active: true },
                attributes: ['user_id', 'email', 'role', 'first_name', 'last_name', 'last_login', 'is_active', 'created_at', 'updated_at']
            });
            return users.map(u => u.toJSON());
        } catch (error) {
            console.error(`Failed To Fetch All Users: ${error}`);
            throw new Error(`Error Occurred While Fetching Users: ${error}`);
        }
    },

    update: async (user_id, updates) => {
        try {
            const updateData = {};
            if (updates.email !== undefined) updateData.email = updates.email;
            if (updates.password_hash !== undefined) updateData.password_hash = updates.password_hash;
            if (updates.first_name !== undefined) updateData.first_name = updates.first_name;
            if (updates.last_name !== undefined) updateData.last_name = updates.last_name;
            if (updates.role !== undefined) updateData.role = updates.role;
            if (updates.is_active !== undefined) updateData.is_active = updates.is_active;
            
            if (Object.keys(updateData).length === 0) {
                throw new Error("No fields to update");
            }
            
            updateData.updated_at = new Date();
            
            const [result] = await User.update(updateData, {
                where: { user_id }
            });
            
            return result;
        } catch (error) {
            console.error(`User update error: ${error.message}`);
            throw new Error(`Failed to update user: ${error.message}`);
        }
    },
    
    updateLastLogin: async (user_id) => {
        try {
            const [result] = await User.update(
                { last_login: new Date() },
                { where: { user_id } }
            );
            return result;
        } catch (error) {
            console.error(`Update last login error: ${error.message}`);
            throw new Error(`Failed to update last login: ${error.message}`);
        }
    },

    softDelete: async (user_id) => {
        try {
            const [result] = await User.update(
                { is_active: false },
                { where: { user_id } }
            );
            return result;
        } catch (error) {
            console.error(`Soft User Deletion: ${error.message}`);
            throw new Error(`Error Occurred While Deleting User: ${error}`);
        }
    },

    hardDelete: async (user_id) => {
        try {
            const result = await User.destroy({
                where: { user_id }
            });
            return result;
        } catch (error) {
            console.error(`Hard User Deletion: ${error.message}`);
            throw new Error(`Error Occurred While Deleting User: ${error}`);
        }
    }
};

export default User;