const Product = require('../models/Product');

// Fungsi untuk mengambil semua produk
const fetchAllProducts = async () => {
    try {
        return await Product.find();
    } catch (error) {
        throw new Error('Error fetching products: ' + error.message);
    }
};

// Fungsi untuk menambah produk
// ada sedikit perubahan
const createProduct = async (productData) => {
    try {
        const product = new Product(productData);
        const savedProduct = await product.save();
        return savedProduct;
    } catch (error) {
        throw new Error('Error adding product: ' + error.message);
    }
};

// Fungsi untuk memperbarui produk
const updateProductById = async (productId, productData) => {
    try {
        const updatedProduct = await Product.findByIdAndUpdate(productId, productData, { new: true });
        if (!updatedProduct) throw new Error('Product not found');
        return updatedProduct;
    } catch (error) {
        throw new Error('Error updating product: ' + error.message);
    }
};

// Fungsi untuk menghapus produk
const deleteProductById = async (productId) => {
    try {
        const deletedProduct = await Product.findByIdAndDelete(productId);
        if (!deletedProduct) throw new Error('Product not found');
        return { message: 'Product deleted successfully' };
    } catch (error) {
        throw new Error('Error deleting product: ' + error.message);
    }
};

module.exports = {
    fetchAllProducts,
    createProduct,
    updateProductById,
    deleteProductById,
};
