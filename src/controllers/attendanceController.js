const AttendanceService = require('../services/attendanceService');

// Controller for adding a new check-in
const addCheckIn = async (req, res) => {
    try {
        const checkInData = req.body; // Get data from body
        const checkInImage = req.file; // Get uploaded check-in image

        // Validate input
        if (!checkInImage) {
            return res.status(400).json({ message: 'Check-in image is required' });
        }

        // Call service to add check-in
        const attendance = await AttendanceService.addCheckIn(checkInData, checkInImage);
        res.status(201).json(attendance);
    } catch (error) {
        console.error(error);
        if (error.message === 'User has already checked in for today.') {
            return res.status(400).json({ message: 'You have already checked in today.' });
        }
        res.status(500).json({ message: 'An error occurred while adding check-in.', error: error.message });
    }
};

// Controller for adding check-out data
const addCheckOut = async (req, res) => {
    try {
        const attendanceId = req.params.id; // Get ID from parameter
        const checkOutImage = req.file; // Get uploaded check-out image

        // Validate input
        if (!checkOutImage) {
            return res.status(400).json({ message: 'Check-out image is required' });
        }

        // Call service to add check-out
        const updatedAttendance = await AttendanceService.addCheckOut(attendanceId, checkOutImage);

        if (!updatedAttendance) {
            return res.status(404).json({ message: 'Attendance data not found' });
        }
        res.status(200).json(updatedAttendance);
    } catch (error) {
        console.error(error);
        if (error.message === 'User has not checked in.') {
            return res.status(400).json({ message: 'You have not checked in.' });
        } else if (error.message === 'User has already checked out.') {
            return res.status(400).json({ message: 'You have already checked out.' });
        }
        res.status(500).json({ message: 'An error occurred while adding check-out.', error: error.message });
    }
};

// Controller for getting all attendance records
const getAllAttendance = async (req, res) => {
    try {
        const attendanceList = await AttendanceService.getAllAttendance();
        res.status(200).json(attendanceList);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'An error occurred while retrieving attendance records.', error: error.message });
    }
};

// Controller for getting attendance data by ID
const getAttendanceById = async (req, res) => {
    try {
        const attendanceId = req.params.id; // Get ID from parameter
        const attendance = await AttendanceService.getAttendanceById(attendanceId); // Call service

        if (!attendance) {
            return res.status(404).json({ message: 'Attendance data not found' });
        }

        res.status(200).json(attendance);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'An error occurred while retrieving attendance data.', error: error.message });
    }
};

// Controller for updating attendance
const updateAttendance = async (req, res) => {
    try {
        const attendanceId = req.params.id;
        const updateData = req.body;

        // Periksa dan update gambar jika ada
        if (req.files) {
            if (req.files.checkInImage) {
                updateData.checkInImage = req.files.checkInImage[0].path;
            }
            if (req.files.checkOutImage) {
                updateData.checkOutImage = req.files.checkOutImage[0].path;
            }
        }

        const updatedAttendance = await AttendanceService.updateAttendance(attendanceId, updateData);
        res.status(200).json(updatedAttendance);
    } catch (error) {
        console.error("Error updating attendance:", error); // Tambahkan detail error
        res.status(500).json({ message: 'An error occurred while updating attendance.', error: error.message });
    }
};

// Controller for deleting attendance
const deleteAttendance = async (req, res) => {
    try {
        const attendanceId = req.params.id; // Get ID from parameter
        await AttendanceService.deleteAttendance(attendanceId); // Call service to delete attendance
        res.status(204).send(); // No content to send back
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'An error occurred while deleting attendance.', error: error.message });
    }
};

module.exports = {
    addCheckIn,
    addCheckOut,
    getAllAttendance,
    getAttendanceById,
    updateAttendance,
    deleteAttendance
};
