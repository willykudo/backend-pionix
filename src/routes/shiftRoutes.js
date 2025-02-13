const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();
const shiftController = require('../controllers/shiftController');
const authMiddleware = require('../middleware/authMiddleware');

// Middleware to validate ObjectId format
const validateId = (req, res, next) => {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
        return res.status(400).json({ message: 'Invalid ID format' });
    }
    next();
};

// Route untuk membuat shift baru
router.post('/', shiftController.createShift);

// Route untuk mengambil semua shift
router.get('/', authMiddleware, shiftController.getAllShifts);

// Route untuk mengambil shift berdasarkan ID
router.get('/:id', validateId, shiftController.getShiftById);

// Route untuk memperbarui shift berdasarkan ID
router.put('/:id', validateId, shiftController.updateShift);

// Route untuk menghapus shift berdasarkan ID
router.delete('/:id', validateId, shiftController.deleteShift);

module.exports = router;
