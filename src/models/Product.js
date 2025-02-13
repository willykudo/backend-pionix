const mongoose = require('mongoose')

const productSchema = new mongoose.Schema({
    productId: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    category: { type: String, required: true },
    quantity: { type: Number, required: true },
    price: { type: Number, required: true },
    minStock: { type: Number, required: true },
})

const Product = mongoose.model('Product', productSchema)
module.exports = Product