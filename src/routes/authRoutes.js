// routes/authRoutes.js
const express = require('express');
const authMiddleware = require('../middleware/authMiddleware');
const {
    registerUser,
    loginUser,
    getAllUsers,
    getUserById,
    updateUser,
    deleteUser,
    resetPassword
} = require('../controllers/authController');
const User = require('../models/User')
const router = express.Router();

// Route for registering a new user
router.post('/register', registerUser);

// Route for logging in and obtaining a token
router.post('/login', loginUser);

// Protected route to get all users (admin only)
router.get('/users', authMiddleware, getAllUsers);

// Protected route to get a specific user by ID
router.get('/users/:id', authMiddleware, getUserById);

// Protected route to update a specific user by ID
router.put('/users/:id', updateUser);

// Protected route to delete a specific user by ID
router.delete('/users/:id', deleteUser);

router.get('/profile', authMiddleware, async (req, res) => {
    try {
        const user = await User.findById(req.userId); // req.userId berasal dari verifyToken middleware
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.json(user);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching user profile' });
    }
});

router.post('/reset-password', resetPassword);

module.exports = router;
