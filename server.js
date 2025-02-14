require('dotenv').config(); // Memuat file .env

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');

// Rute
const productRoutes = require('./src/routes/productRoutes');
const rentalRoutes = require('./src/routes/rentalRoutes');
const attendanceRoutes = require('./src/routes/attendanceRoutes');
const authRoutes = require('./src/routes/authRoutes');
const shiftRoutes = require('./src/routes/shiftRoutes');

const app = express();
const PORT = process.env.PORT || 5000; // Gunakan port dari .env atau 5000 sebagai default

// Middleware untuk parsing JSON dan CORS
app.use(express.json());
app.use(cors({
    origin: true, 
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// URI MongoDB dari .env
const mongoUri = process.env.MONGO_URI;

if (!mongoUri) {
    console.error('MongoDB URI tidak ditemukan. Pastikan file .env berisi MONGO_URI.');
    process.exit(1);
}

// console.log('MongoDB URI:', mongoUri);

// Koneksi ke MongoDB
mongoose.set('strictQuery', true); // Opsional: Menghindari peringatan Mongoose di versi baru
mongoose.connect(mongoUri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
    .then(() => {
        console.log('Koneksi ke MongoDB berhasil');
    })
    .catch((err) => {
        // console.error('Koneksi ke MongoDB gagal:', err.message);
        if (err.cause) {
            console.error('Penyebab error (cause):', err.cause);
        }
        // console.error('Detail error:', err); // Menampilkan stack trace error
        process.exit(1);
    });

mongoose.connection.on('error', (err) => {
    // console.error('Error pada koneksi MongoDB:', err.message);
    if (err.cause) {
        // console.error('Penyebab error (cause):', err.cause);
    }
});

// Rute aplikasi
app.use('/api/products', productRoutes);
app.use('/api/rentals', rentalRoutes);
app.use('/api/attendance', attendanceRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/shifts', shiftRoutes);

// Middleware untuk menangani error umum
app.use((err, req, res, next) => {
    console.error('Unhandled Error:', err.stack);
    const errorResponse = {
        message: 'Terjadi kesalahan pada server',
        error: err.message,
    };
    if (err.cause) {
        errorResponse.cause = err.cause;
        // console.error('Penyebab error (cause):', err.cause);
    }
    res.status(500).json(errorResponse);
});

// Menjalankan server
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
