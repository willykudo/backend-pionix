const mongoose = require('mongoose');
const moment = require('moment');

const shiftSchema = new mongoose.Schema({
    employeeIds: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User', // Referensi ke model User
        required: true
    }],
    startDate: {
        type: Date,
        required: true
    },
    shiftType: {
        type: String,
        enum: ['Morning', 'Afternoon'],
        required: true
    },
    shiftStart: {
        type: String,  // Format: HH:mm
        required: true,
        validate: {
            validator: (v) => /^([0-1][0-9]|2[0-3]):([0-5][0-9])$/.test(v),
            message: 'Invalid time format for shiftStart'
        }
    },
    shiftEnd: {
        type: String,  // Format: HH:mm
        required: true,
        validate: {
            validator: (v) => /^([0-1][0-9]|2[0-3]):([0-5][0-9])$/.test(v),
            message: 'Invalid time format for shiftEnd'
        }
    },
    // Rentang waktu shift
    endDate: {
        type: Date,
        required: false // Tidak wajib, untuk shift yang berlangsung di hari yang sama
    },
    notes: {
        type: String,
        default: ''
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

// Index untuk mencari shift berdasarkan startDate dan shiftType
shiftSchema.index({ startDate: 1, shiftType: 1 });

// Menambahkan validasi agar tidak ada lebih dari 1 shift per hari untuk 1 user dengan tipe shift yang sama
shiftSchema.statics.validateUniqueShift = async function (userId, startDate, shiftType) {
    const existingShift = await this.findOne({
        employeeIds: userId,
        startDate: startDate,
        shiftType: shiftType
    });
    if (existingShift) {
        throw new Error('User already has a shift on this day with the same shift type');
    }
};

// Validasi untuk rentang shift yang lebih dari 1 hari
shiftSchema.statics.validateShiftRange = async function (shiftStartDate, shiftEndDate) {
    if (shiftEndDate && shiftStartDate > shiftEndDate) {
        throw new Error('End date cannot be before start date');
    }
};

const Shift = mongoose.model('Shift', shiftSchema);
module.exports = Shift;
