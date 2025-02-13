const express = require('express');
const router = express.Router();
const AttendanceController = require('../controllers/attendanceController');
const attendanceService = require('../services/attendanceService'); // Mengimpor service untuk multer
const authMiddleware = require('../middleware/authMiddleware');

// Rute untuk menambah data check-in
router.post('/checkin', attendanceService.upload.single('checkInImage'), AttendanceController.addCheckIn);

// Rute untuk menambah data check-out
router.post('/checkout/:id', attendanceService.upload.single('checkOutImage'), AttendanceController.addCheckOut);

// Rute untuk mendapatkan semua data presensi
router.get('/', authMiddleware, AttendanceController.getAllAttendance);

// Rute untuk mendapatkan data presensi berdasarkan ID
router.get('/:id', AttendanceController.getAttendanceById);

// Rute untuk memperbarui data presensi berdasarkan ID
router.put('/:id', attendanceService.upload.fields([
    { name: 'checkInImage', maxCount: 1 },
    { name: 'checkOutImage', maxCount: 1 }
]), AttendanceController.updateAttendance);

// Rute untuk menghapus data presensi berdasarkan ID
router.delete('/:id', AttendanceController.deleteAttendance);

module.exports = router;
