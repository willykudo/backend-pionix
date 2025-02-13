jest.mock('../../src/models/Product', () => {
    return jest.fn().mockImplementation(() => ({
        save: jest.fn(), // Mock fungsi `save` untuk instance model
    }));
});

const productService = require('../../src/services/productService');
const Product = require('../../src/models/Product');

describe('Product Service', () => {
    beforeEach(() => {
        jest.clearAllMocks(); // Membersihkan semua mock sebelum setiap tes
    });

    describe('fetchAllProducts', () => {
        it('should fetch all products successfully', async () => {
            const mockProducts = [{ name: 'Product A' }, { name: 'Product B' }];

            Product.find = jest.fn().mockResolvedValue(mockProducts);

            const products = await productService.fetchAllProducts();
            expect(products).toEqual(mockProducts);
            expect(Product.find).toHaveBeenCalledTimes(1);
        });

        it('should throw an error if fetching products fails', async () => {
            Product.find = jest.fn().mockRejectedValue(new Error('Database error'));

            await expect(productService.fetchAllProducts()).rejects.toThrow('Error fetching products: Database error');
        });
    });

    describe('createProduct', () => {
        it('should create a new product successfully', async () => {
            const mockProductData = {
                productId: '12345',
                name: 'New Product',
                category: 'Category A',
                quantity: 10,
                price: 100,
                minStock: 5,
            };

            Product.mockImplementation(() => ({
                save: jest.fn().mockResolvedValue(mockProductData), // Mengembalikan data mock
            }));

            const product = await productService.createProduct(mockProductData);

            // Validasi properti
            const { productId, name, category, quantity, price, minStock } = product;
            expect({ productId, name, category, quantity, price, minStock }).toEqual(mockProductData);

            expect(Product).toHaveBeenCalledWith(mockProductData); // Validasi konstruktor dipanggil
        });

        it('should throw an error if creating product fails', async () => {
            // Mock `save` untuk mensimulasikan error
            Product.mockImplementation(() => ({
                save: jest.fn().mockRejectedValue(new Error('Database error')),
            }));

            await expect(
                productService.createProduct({
                    productId: '12345',
                    name: 'New Product',
                    category: 'Category A',
                    quantity: 10,
                    price: 100,
                    minStock: 5,
                })
            ).rejects.toThrow('Error adding product: Database error');
        });
    });

    describe('updateProductById', () => {
        it('should update a product successfully', async () => {
            const mockProductId = '123';
            const mockProductData = { name: 'Updated Product', price: 200 };
            const mockUpdatedProduct = { _id: mockProductId, ...mockProductData };

            Product.findByIdAndUpdate = jest.fn().mockResolvedValue(mockUpdatedProduct);

            const updatedProduct = await productService.updateProductById(mockProductId, mockProductData);
            expect(updatedProduct).toEqual(mockUpdatedProduct);
            expect(Product.findByIdAndUpdate).toHaveBeenCalledWith(mockProductId, mockProductData, { new: true });
        });

        it('should throw an error if product is not found', async () => {
            const mockProductId = '123';
            Product.findByIdAndUpdate = jest.fn().mockResolvedValue(null);

            await expect(productService.updateProductById(mockProductId, { name: 'Updated Product' }))
                .rejects.toThrow('Product not found');
        });

        it('should throw an error if updating product fails', async () => {
            const mockProductId = '123';
            Product.findByIdAndUpdate = jest.fn().mockRejectedValue(new Error('Database error'));

            await expect(productService.updateProductById(mockProductId, { name: 'Updated Product' }))
                .rejects.toThrow('Error updating product: Database error');
        });
    });

    describe('deleteProductById', () => {
        it('should delete a product successfully', async () => {
            const mockProductId = '123';
            const mockDeletedProduct = { _id: mockProductId, name: 'Deleted Product' };

            Product.findByIdAndDelete = jest.fn().mockResolvedValue(mockDeletedProduct);

            const result = await productService.deleteProductById(mockProductId);
            expect(result).toEqual({ message: 'Product deleted successfully' });
            expect(Product.findByIdAndDelete).toHaveBeenCalledWith(mockProductId);
        });

        it('should throw an error if product is not found', async () => {
            const mockProductId = '123';
            Product.findByIdAndDelete = jest.fn().mockResolvedValue(null);

            await expect(productService.deleteProductById(mockProductId)).rejects.toThrow('Product not found');
        });

        it('should throw an error if deleting product fails', async () => {
            const mockProductId = '123';
            Product.findByIdAndDelete = jest.fn().mockRejectedValue(new Error('Database error'));

            await expect(productService.deleteProductById(mockProductId)).rejects.toThrow(
                'Error deleting product: Database error'
            );
        });
    });
});
