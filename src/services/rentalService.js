const Rental = require('../models/Rental');
const multer = require('multer');
const path = require('path');

// Konfigurasi Multer
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/'); // Folder tempat menyimpan gambar
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname)); // Nama file unik
    }
});

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

// Fungsi untuk memvalidasi data rental
const validateRentalData = (rentalData, rentalStatus) => {
    const { customerName, rentalDate, returnDate, rentalDuration } = rentalData;


    if (rentalStatus === 'Available' || rentalStatus === 'Maintenance') {
        if (
            customerName !== '' ||
            rentalDate !== '' ||
            returnDate !== '' ||
            rentalDuration !== '0'
        ) {
            throw new Error('customerName, rentalDate, returnDate harus kosong dan rentalDuration harus 0 jika status available/maintenance');
        }
    }
};

// Fungsi untuk menambah penyewaan baru
const createRental = async (rentalData, rentalImage) => {
    // Validasi data rental
    validateRentalData(rentalData, rentalData.rentalStatus);

    const newRental = new Rental({
        ...rentalData,
        rentalImage: rentalImage.path
    });

    return await newRental.save();
};

// Fungsi untuk memperbarui penyewaan berdasarkan ID
const updateRentalById = async (rentalId, rentalData, rentalImage) => {
    // Validasi data rental
    validateRentalData(rentalData, rentalData.rentalStatus);

    const updatedData = { ...rentalData };

    if (rentalImage) {
        updatedData.rentalImage = rentalImage.path; // Update gambar jika ada
    }

    return await Rental.findByIdAndUpdate(rentalId, updatedData, { new: true });
};

// Fungsi untuk mendapatkan semua penyewaan
const getAllRentals = async () => {
    return await Rental.find();
};

// Fungsi untuk menghapus penyewaan berdasarkan ID
const deleteRentalById = async (rentalId) => {
    return await Rental.findByIdAndDelete(rentalId);
};

module.exports = {
    upload,  // Digunakan di routes
    createRental,
    getAllRentals,
    updateRentalById,
    deleteRentalById
};
