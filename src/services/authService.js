// services/authService.js
const User = require('../models/User');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

class AuthService {
    async registerUser(username, password, role, name) {
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const newUser = new User({ username, password: hashedPassword, role, name });
        const saveUser = await newUser.save();

        return saveUser;
    }


    async loginUser(username, password) {
        const user = await User.findOne({ username });
        if (!user) throw new Error('User not found');


        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) throw new Error('Invalid credentials');

        const token = jwt.sign(
            { id: user._id, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: '1d' }
        );

        return { token, user };
    }


    async getAllUsers() {
        return await User.find({});
    }

    async getUserById(userId) {
        const user = await User.findById(userId);
        if (!user) throw new Error('User not found');
        return user;
    }

    async updateUser(userId, updateData) {
        const user = await User.findById(userId);
        if (!user) throw new Error('User not found');

        // Check if the username is being updated and ensure it is unique
        if (updateData.username && updateData.username !== user.username) {
            const existingUser = await User.findOne({ username: updateData.username });
            if (existingUser) throw new Error('Username already taken');
        }

        // If password is being updated, hash it
        if (updateData.password) {
            const salt = await bcrypt.genSalt(10);
            updateData.password = await bcrypt.hash(updateData.password, salt);
        }

        // Perform the update
        const updatedUser = await User.findByIdAndUpdate(userId, updateData, { new: true });

        // After update, the user will need to log in again with updated credentials
        return updatedUser;
    }

    async deleteUser(userId) {
        const user = await User.findByIdAndDelete(userId);
        if (!user) throw new Error('User not found');
        return user;
    }

    async resetPassword(username, newPassword) {
        const user = await User.findOne({ username });
        if (!user) {
            throw new Error('User not found.');
        }

        // Generate salt dan hash password baru
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(newPassword, salt);
        user.password = hashedPassword;

        await user.save();

        // Setelah password di-reset, login otomatis dengan JWT token
        const token = jwt.sign(
            { id: user._id, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: '1d' }
        );

        return { message: 'Password reset successful!', token };
    }



}

module.exports = new AuthService();
