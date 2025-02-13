const mongoose = require('mongoose');

const rentalSchema = new mongoose.Schema({
    rentalId: { type: String, required: true },
    equipmentName: { type: String, required: true },
    rentalStatus: {
        type: String,
        required: true,
        enum: ['Available', 'Rented', 'Maintenance'], // Pilihan status penyewaan
    },
    customerName: { type: String },
    rentalDate: { type: Date },
    returnDate: { type: Date },
    rentalDuration: { type: Number },
    rentalPrice: { type: Number, required: true },
    equipmentCondition: {
        type: String,
        required: true,
        enum: ['New', 'Good', 'Fair', 'Poor'], // Pilihan kondisi alat
    },
    description: { type: String },
    rentalImage: { type: String, required: true },
});

module.exports = mongoose.model('Rental', rentalSchema);
