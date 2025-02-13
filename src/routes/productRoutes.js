const express = require('express')
const {
    getProducts,
    addProduct,
    updateProduct,
    deleteProduct
} = require('../controllers/productController')
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router()

// Rute untuk mengambil semua peroduk
router.get('/', authMiddleware, getProducts)

//  Rute untuk menambah produk 
router.post('/', addProduct)

// Rute untuk memperbarui produk
router.put('/:id', updateProduct)

// Rute untuk menghapus produk
router.delete('/:id', deleteProduct)

module.exports = router