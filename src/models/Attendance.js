const mongoose = require('mongoose');

const attendanceSchema = new mongoose.Schema({
    employeeId: {
        type: String,
        required: true
    },
    employeeName: {
        type: String,
        required: true
    },
    checkInTime: {
        type: Date
    },
    checkInImage: {
        type: String
    },
    checkOutTime: {
        type: Date
    },
    checkOutImage: {
        type: String
    },
    status: {
        type: String,
        enum: ['On Time, Pending', 'Late, Pending', 'On Time, Overworked', 'Late, Overworked', 'On Time, Underworked', 'Late, Underworked', 'On Time, On Time', 'Late, On Time'],
        default: 'On Time, Pending'
    },
    shiftStartTime: {
        type: Date,
        required: true
    },
    shiftEndTime: {
        type: Date,
        required: true
    }
});

const Attendance = mongoose.model('Attendance', attendanceSchema);

module.exports = Attendance;
