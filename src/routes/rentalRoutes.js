const express = require('express');
const router = express.Router();
const RentalController = require('../controllers/rentalController');
const RentalService = require('../services/rentalService');
const authMiddleware = require('../middleware/authMiddleware');

// Route untuk menambah penyewaan baru
router.post('/', RentalService.upload.single('rentalImage'), RentalController.createRental);

// Route untuk mendapatkan semua penyewaan
router.get('/', authMiddleware, RentalController.getAllRentals);

// Route untuk memperbarui penyewaan berdasarkan ID
router.put('/:id', RentalService.upload.single('rentalImage'), RentalController.updateRentalById);

// Route untuk menghapus penyewaan berdasarkan ID
router.delete('/:id', RentalController.deleteRentalById);

module.exports = router;
