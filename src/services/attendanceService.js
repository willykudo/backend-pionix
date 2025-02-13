const Attendance = require('../models/Attendance');
const multer = require('multer');
const path = require('path');
const moment = require('moment-timezone'); // Import moment-timezone

// Fungsi untuk menentukan status check-in dan check-out secara gabungan
const determineStatus = (checkInTime, checkOutTime, shiftStartTime, shiftEndTime) => {
    const shiftStartDateTime = new Date(shiftStartTime);
    const shiftEndDateTime = new Date(shiftEndTime);
    const checkInDateTime = new Date(checkInTime);
    const checkOutDateTime = checkOutTime ? new Date(checkOutTime) : null;

    // Status Check-in
    let checkInStatus;
    if (checkInDateTime > shiftStartDateTime) {
        checkInStatus = 'Late'; // Terlambat check-in
    } else {
        checkInStatus = 'On Time'; // Tepat waktu check-in atau lebih awal
    }

    // Status Check-out
    let checkOutStatus;
    if (!checkOutTime) {
        checkOutStatus = 'Pending'; // Check-out belum dilakukan
    } else if (checkOutDateTime < shiftEndDateTime) {
        checkOutStatus = 'Underworked'; // Pulang lebih awal
    } else if (checkOutDateTime > shiftEndDateTime) {
        checkOutStatus = 'Overworked'; // Pulang lebih lama
    } else {
        checkOutStatus = 'On Time'; // Tepat waktu check-out
    }

    // Gabungkan status
    return `${checkInStatus}, ${checkOutStatus}`;
};

// Konfigurasi Multer
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/'); // Folder tempat menyimpan gambar
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname)); // Nama file unik
    }
});

// Inisialisasi multer
const upload = multer({
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // Batas ukuran file 5MB
    fileFilter: (req, file, cb) => {
        const filetypes = /jpeg|jpg|png|webp/;
        const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
        const mimetype = filetypes.test(file.mimetype);

        if (extname && mimetype) {
            return cb(null, true);
        } else {
            cb(new Error('Gambar harus berformat JPEG atau PNG'));
        }
    }
});

// Fungsi untuk menambah data check-in
const addCheckIn = async (data, checkInImage) => {
    const { employeeId, employeeName, shiftStartTime, shiftEndTime } = data;

    // Gunakan waktu lokal untuk checkInTime
    const checkInTime = moment().tz('Asia/Jakarta').toISOString(); // Menggunakan waktu lokal WIB

    const existingAttendance = await Attendance.findOne({
        employeeId,
        checkInTime: {
            $gte: new Date(new Date().setHours(0, 0, 0, 0)), // Awal hari
            $lt: new Date(new Date().setHours(23, 59, 59, 999)) // Akhir hari
        }
    });

    if (existingAttendance) {
        throw new Error('User has already checked in for today.');
    }

    // Simpan shiftStartTime dan shiftEndTime juga dalam waktu lokal WIB
    const shiftStart = moment.tz(shiftStartTime, 'Asia/Jakarta').toISOString();
    const shiftEnd = moment.tz(shiftEndTime, 'Asia/Jakarta').toISOString();

    // Tentukan status
    const status = determineStatus(checkInTime, null, shiftStart, shiftEnd);

    const newAttendance = new Attendance({
        employeeId,
        employeeName,
        checkInTime,
        checkInImage: checkInImage.path,
        shiftStartTime: shiftStart,
        shiftEndTime: shiftEnd,
        status
    });

    return await newAttendance.save();
};

// Fungsi untuk menambah data check-out
const addCheckOut = async (attendanceId, checkOutImage) => {
    const attendance = await Attendance.findById(attendanceId);

    if (!attendance) {
        throw new Error('Attendance not found');
    }

    if (!attendance.checkInTime) {
        throw new Error('User has not checked in.');
    }

    if (attendance.checkOutTime) {
        throw new Error('User has already checked out.');
    }

    // Gunakan waktu lokal untuk checkOutTime
    attendance.checkOutTime = moment().tz('Asia/Jakarta').toISOString(); // Simpan sebagai WIB
    attendance.checkOutImage = checkOutImage.path;

    // Perbarui status setelah check-out
    attendance.status = determineStatus(attendance.checkInTime, attendance.checkOutTime, attendance.shiftStartTime, attendance.shiftEndTime);

    return await attendance.save();
};

// Fungsi untuk memperbarui data presensi berdasarkan ID
const updateAttendance = async (id, updateData, files) => {
    try {

        // Ambil attendance yang ada
        const attendance = await Attendance.findById(id);
        if (!attendance) {
            throw new Error('Attendance not found');
        }

        // Update checkInImage dan checkOutImage jika ada file baru
        if (files) {
            if (files.checkInImage) {
                attendance.checkInImage = files.checkInImage[0].path;
            }
            if (files.checkOutImage) {
                attendance.checkOutImage = files.checkOutImage[0].path;
            }
        }

        // Update fields lain yang ada di updateData
        Object.assign(attendance, updateData);

        // Perbarui status setelah update
        attendance.status = determineStatus(attendance.checkInTime, attendance.checkOutTime, attendance.shiftStartTime, attendance.shiftEndTime);

        const updatedAttendance = await attendance.save();

        return updatedAttendance;
    } catch (error) {
        throw new Error('Error updating attendance: ' + error.message);
    }
};

// Fungsi untuk mendapatkan semua data presensi
const getAllAttendance = async () => {
    return await Attendance.find({});
};

// Fungsi untuk mendapatkan data presensi berdasarkan ID
const getAttendanceById = async (id) => {
    const attendance = await Attendance.findById(id);
    if (!attendance) {
        throw new Error('Attendance not found');
    }
    return attendance;
};

// Fungsi untuk menghapus data presensi berdasarkan ID
// ada sedikit perubahan
const deleteAttendance = async (id) => {
    const attendance = await Attendance.findByIdAndDelete(id);
    if (!attendance) {
        throw new Error('Attendance not found');
    }
    return attendance;
}


module.exports = {
    upload,
    addCheckIn,
    addCheckOut,
    getAllAttendance,
    getAttendanceById,
    updateAttendance,
    deleteAttendance,
    determineStatus
};
