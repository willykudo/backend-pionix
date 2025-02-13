const shiftService = require('../services/shiftService');

// Membuat shift baru
const createShift = async (req, res) => {
    try {
        const shift = await shiftService.createShift(req.body);
        res.status(201).json(shift);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// Mendapatkan semua shift
const getAllShifts = async (req, res) => {
    try {
        const shifts = await shiftService.getAllShifts();
        res.status(200).json(shifts);
    } catch (error) {
        res.status(500).json({ message: 'Failed to get shifts', error: error.message });
    }
};

// Mendapatkan shift berdasarkan ID
const getShiftById = async (req, res) => {
    try {
        const shift = await shiftService.getShiftById(req.params.id);
        if (!shift) return res.status(404).json({ message: 'Shift not found' });
        res.status(200).json(shift);
    } catch (error) {
        res.status(500).json({ message: 'Failed to get shift', error: error.message });
    }
};

// Memperbarui shift berdasarkan ID
const updateShift = async (req, res) => {
    try {
        const shift = await shiftService.updateShift(req.params.id, req.body);
        if (!shift) return res.status(404).json({ message: 'Shift not found' });
        res.status(200).json(shift);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// Menghapus shift berdasarkan ID
const deleteShift = async (req, res) => {
    try {
        const shift = await shiftService.deleteShift(req.params.id);
        if (!shift) return res.status(404).json({ message: 'Shift not found' });
        res.status(200).json({ message: 'Shift deleted successfully', shift });
    } catch (error) {
        res.status(500).json({ message: 'Failed to delete shift', error: error.message });
    }
};

module.exports = {
    createShift,
    getAllShifts,
    getShiftById,
    updateShift,
    deleteShift,
};
