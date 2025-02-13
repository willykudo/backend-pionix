const Shift = require('../models/Shift');

// Validasi format waktu
const validateTimeFormat = (time) => /^([0-1][0-9]|2[0-3]):([0-5][0-9])$/.test(time);

// Validasi agar endDate tidak sebelum startDate
const validateDateRange = (startDate, endDate) => {
    if (endDate && new Date(endDate) < new Date(startDate)) {
        throw new Error('endDate cannot be before startDate');
    }
};

// Helper function untuk menghasilkan semua tanggal di rentang waktu
const getDatesInRange = (start, end) => {
    const dates = [];
    let currentDate = new Date(start);
    while (currentDate <= new Date(end)) {
        dates.push(new Date(currentDate).toISOString().split('T')[0]); // Format YYYY-MM-DD
        currentDate.setDate(currentDate.getDate() + 1);
    }
    return dates;
};

const createShift = async (shiftData) => {
    const { shiftStart, shiftEnd, employeeIds, startDate, endDate, shiftType, notes } = shiftData;

    // Validasi format waktu
    if (!validateTimeFormat(shiftStart) || !validateTimeFormat(shiftEnd)) {
        throw new Error('Invalid time format for shiftStart or shiftEnd');
    }

    // Validasi rentang tanggal
    validateDateRange(startDate, endDate);

    // Jika endDate tidak ada, set sebagai startDate
    const effectiveEndDate = endDate || startDate;

    // Mendapatkan semua tanggal dari rentang startDate sampai endDate
    const allDates = getDatesInRange(startDate, effectiveEndDate);

    const createdShifts = []; // Untuk menyimpan hasil shifts yang dibuat

    try {
        for (const employeeId of employeeIds) {
            for (const date of allDates) {
                // Validasi agar karyawan hanya memiliki satu shift per hari
                const existingShiftForDay = await Shift.findOne({
                    employeeIds: employeeId,
                    startDate: date
                });
                if (existingShiftForDay) {
                    throw new Error(`User with ID ${employeeId} already has a shift on ${date}`);
                }

                // Membuat shift baru untuk user dan tanggal spesifik
                const newShift = new Shift({
                    employeeIds: [employeeId], // Shift hanya untuk satu user
                    startDate: date,
                    endDate: date, // Karena per hari, startDate dan endDate sama
                    shiftStart,
                    shiftEnd,
                    shiftType,
                    notes
                });

                const savedShift = await newShift.save();
                createdShifts.push(savedShift); // Simpan ke dalam array hasil
            }
        }

        return createdShifts; // Kembalikan semua shift yang berhasil dibuat
    } catch (error) {
        throw new Error('Error creating shifts: ' + error.message);
    }
};

// Mendapatkan semua shift
const getAllShifts = async () => {
    try {
        return await Shift.find().populate('employeeIds', 'name email'); // Mengambil nama dan email dari karyawan
    } catch (error) {
        throw new Error('Error fetching all shifts: ' + error.message);
    }
};

// Mendapatkan shift berdasarkan ID
const getShiftById = async (id) => {
    try {
        return await Shift.findById(id).populate('employeeIds', 'name email');
    } catch (error) {
        throw new Error('Error fetching shift by ID: ' + error.message);
    }
};

// Update shift
const updateShift = async (id, shiftData) => {
    const { shiftStart, shiftEnd, employeeIds, startDate, endDate, shiftType, notes } = shiftData;

    // Validasi format waktu
    if (shiftStart && !validateTimeFormat(shiftStart)) {
        throw new Error('Invalid time format for shiftStart');
    }
    if (shiftEnd && !validateTimeFormat(shiftEnd)) {
        throw new Error('Invalid time format for shiftEnd');
    }

    // Validasi rentang tanggal
    validateDateRange(startDate, endDate);

    // Jika endDate tidak ada, set sebagai startDate
    const effectiveEndDate = endDate || startDate;

    // Mendapatkan semua tanggal dari rentang startDate sampai endDate
    const allDates = getDatesInRange(startDate, effectiveEndDate);

    try {
        // Mendapatkan shift lama berdasarkan ID
        const existingShift = await Shift.findById(id);
        if (!existingShift) {
            throw new Error('Shift not found');
        }

        // Dapatkan semua tanggal dari shift lama
        const oldDates = getDatesInRange(existingShift.startDate, existingShift.endDate);

        // Identifikasi tanggal yang perlu dihapus (jika tanggal lama tidak ada di rentang baru)
        const datesToDelete = oldDates.filter(date => !allDates.includes(date));

        // Hapus shift untuk tanggal yang tidak ada di rentang baru
        for (const date of datesToDelete) {
            await Shift.deleteOne({
                employeeIds: { $in: existingShift.employeeIds },
                startDate: date,
                _id: id // Pastikan shift yang dihapus sesuai ID
            });
        }

        const updatedShifts = [];

        for (const employeeId of employeeIds) {
            for (const date of allDates) {
                // Validasi agar karyawan hanya memiliki satu shift per hari
                const existingShiftForDay = await Shift.findOne({
                    employeeIds: employeeId,
                    startDate: date,
                    _id: { $ne: id } // Pastikan shift yang ditemukan bukan shift yang sedang diupdate
                });
                if (existingShiftForDay) {
                    throw new Error(`User with ID ${employeeId} already has another shift on ${date}`);
                }

                if (oldDates.includes(date)) {
                    // Jika tanggal ada di rentang lama, perbarui shift
                    existingShift.shiftStart = shiftStart;
                    existingShift.shiftEnd = shiftEnd;
                    existingShift.shiftType = shiftType;
                    existingShift.notes = notes;

                    const savedShift = await existingShift.save();
                    updatedShifts.push(savedShift);
                } else {
                    // Jika tanggal tidak ada di rentang lama, buat shift baru
                    const newShift = new Shift({
                        employeeIds: [employeeId],
                        startDate: date,
                        endDate: date, // Karena per hari, startDate dan endDate sama
                        shiftStart,
                        shiftEnd,
                        shiftType,
                        notes
                    });

                    const savedShift = await newShift.save();
                    updatedShifts.push(savedShift);
                }
            }
        }

        return updatedShifts; // Kembalikan semua shift yang berhasil diperbarui atau dibuat
    } catch (error) {
        throw new Error('Error updating shifts: ' + error.message);
    }
};

// Hapus shift
const deleteShift = async (id) => {
    try {
        return await Shift.findByIdAndDelete(id);
    } catch (error) {
        throw new Error('Error deleting shift: ' + error.message);
    }
};

module.exports = {
    createShift,
    getAllShifts,
    getShiftById,
    updateShift,
    deleteShift,
};
