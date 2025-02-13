module.exports = {
    // Menggunakan testEnvironment 'node' untuk aplikasi Node.js
    testEnvironment: 'node',

    // Menentukan direktori tempat Jest mencari file testing
    roots: ['<rootDir>/tests'],

    // Ekstensi file yang akan dicari Jest
    moduleFileExtensions: ['js', 'json'],

    // Path yang harus diabaikan oleh Jest saat mencari file
    transformIgnorePatterns: ['/node_modules/'],

    // Mengonfigurasi mock global untuk data lingkungan (misalnya, database)
    setupFilesAfterEnv: ['<rootDir>/tests/setup.js'],

    // Mengaktifkan coverage dan mengonfigurasi direktori output-nya
    collectCoverage: true,
    coverageDirectory: 'coverage',
    coverageProvider: 'v8',

    // Melaporkan tipe coverage yang dibutuhkan
    coverageReporters: ['text', 'lcov'],
};
