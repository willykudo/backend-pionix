// setup.js

// Mock model yang digunakan dalam service
jest.mock('../src/models/Product', () => ({
    findById: jest.fn(),
    save: jest.fn(),
    updateOne: jest.fn(),
}));

// Atur environment variables untuk testing
process.env.NODE_ENV = 'test';

// Setup global variables atau mocking yang diperlukan untuk pengujian
global.someGlobalMock = jest.fn(() => 'mocked value');

// Jika kamu menggunakan database atau koneksi lainnya, pastikan untuk mock atau konfigurasi koneksi testing
const mongoose = require('mongoose');
mongoose.connect = jest.fn();  // Mock koneksi database agar tidak melakukan query nyata

// Setelah semua pengaturan selesai, bisa tambahkan cleaning jika perlu
afterEach(() => {
    // Reset mock setelah setiap test untuk memastikan pengujian bersih
    jest.clearAllMocks();
});
