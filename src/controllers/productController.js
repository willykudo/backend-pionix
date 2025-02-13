const {
    fetchAllProducts,
    createProduct,
    updateProductById,
    deleteProductById,
} = require('../services/productService');

// Mengambil semua produk
exports.getProducts = async (req, res) => {
    try {
        const products = await fetchAllProducts();
        res.json(products);
    } catch (error) {
        res.status(500).send(error.message);
    }
};

// Menambah produk
exports.addProduct = async (req, res) => {
    const productData = req.body;
    try {
        const newProduct = await createProduct(productData);
        res.status(201).json(newProduct);
    } catch (error) {
        res.status(500).send(error.message);
    }
};

// Memperbarui produk
exports.updateProduct = async (req, res) => {
    const productId = req.params.id;
    const productData = req.body;

    try {
        const updatedProduct = await updateProductById(productId, productData);
        res.status(200).json(updatedProduct);
    } catch (error) {
        res.status(500).send(error.message);
    }
};

// Menghapus produk
exports.deleteProduct = async (req, res) => {
    const productId = req.params.id;

    try {
        const result = await deleteProductById(productId);
        res.status(200).json(result);
    } catch (error) {
        res.status(500).send(error.message);
    }
};
