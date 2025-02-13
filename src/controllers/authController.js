// controllers/authController.js
const authService = require('../services/authService');

exports.registerUser = async (req, res) => {
    try {
        const { username, password, role, name } = req.body;

        const newUser = await authService.registerUser(username, password, role, name);
        res.status(201).json({ message: 'User registered successfully', user: newUser });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.loginUser = async (req, res) => {
    try {
        const { username, password } = req.body;

        if (!username || !password) {
            return res.status(400).json({ error: 'Username and password are required' });
        }

        const { token, user } = await authService.loginUser(username, password);
        res.status(200).json({ token, message: 'Login successful', user });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.getAllUsers = async (req, res) => {
    try {
        const users = await authService.getAllUsers();
        res.status(200).json(users);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.getUserById = async (req, res) => {
    try {
        const userId = req.params.id;
        const user = await authService.getUserById(userId);
        res.status(200).json(user);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.updateUser = async (req, res) => {
    try {
        const userId = req.params.id;
        const updateData = req.body;
        const updatedUser = await authService.updateUser(userId, updateData);
        res.status(200).json({ message: 'User updated successfully', user: updatedUser });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.deleteUser = async (req, res) => {
    try {
        const userId = req.params.id;
        await authService.deleteUser(userId);
        res.status(200).json({ message: 'User deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.resetPassword = async (req, res) => {
    try {
        const { username, newPassword } = req.body;
        if (!username || !newPassword) {
            return res.status(400).json({ error: 'Username and new password are required.' });
        }
        // Memanggil service untuk mereset password
        const result = await authService.resetPassword(username, newPassword);

        return res.status(200).json(result); // Menyampaikan hasil sukses ke client
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: error.message || 'Something went wrong, please try again later.' });
    }
}