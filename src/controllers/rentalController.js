const RentalService = require('../services/rentalService');

// Controller untuk menambah penyewaan baru
const createRental = async (req, res) => {
    try {

        // console.log(req.body, req.file);
        const rentalData = req.body; // Ambil data dari body
        const rentalImage = req.file; // Ambil file gambar yang diupload

        if (!rentalImage) {
            return res.status(400).json({ message: 'Gambar tidak ditemukan' });
        }

        const rental = await RentalService.createRental(rentalData, rentalImage);
        res.status(201).json(rental);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Controller untuk mendapatkan semua penyewaan
const getAllRentals = async (req, res) => {
    try {
        const rentals = await RentalService.getAllRentals();
        res.status(200).json(rentals);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Controller untuk memperbarui penyewaan berdasarkan ID
const updateRentalById = async (req, res) => {
    try {
        const rentalId = req.params.id; // Ambil ID dari parameter
        const rentalData = req.body; // Ambil data dari body
        const rentalImage = req.file; // Ambil file gambar yang diupload

        const updatedRental = await RentalService.updateRentalById(rentalId, rentalData, rentalImage);
        if (!updatedRental) {
            return res.status(404).json({ message: 'Penyewaan tidak ditemukan' });
        }
        res.status(200).json(updatedRental);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Controller untuk menghapus penyewaan berdasarkan ID
const deleteRentalById = async (req, res) => {
    try {
        const rentalId = req.params.id; // Ambil ID dari parameter
        const deletedRental = await RentalService.deleteRentalById(rentalId);
        if (!deletedRental) {
            return res.status(404).json({ message: 'Penyewaan tidak ditemukan' });
        }
        res.status(204).send(); // Mengembalikan status 204 No Content
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    createRental,
    getAllRentals,
    updateRentalById,
    deleteRentalById,
};
