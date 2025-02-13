jest.mock('../../src/models/Rental', () => {
    return jest.fn().mockImplementation(() => ({
        save: jest.fn(), // Mock fungsi `save` untuk instance model
    }));
});

const rentalService = require('../../src/services/rentalService');
const Rental = require('../../src/models/Rental');

describe('Rental Service', () => {
    beforeEach(() => {
        jest.clearAllMocks(); // Membersihkan semua mock sebelum setiap tes
    });

    describe('getAllRentals', () => {
        it('should return an array of rentals', async () => {
            const rentals = [
                { customerName: 'John Doe', rentalStatus: 'Rented' },
                { customerName: 'Jane Doe', rentalStatus: 'Available' }
            ];
            Rental.find = jest.fn().mockResolvedValue(rentals);

            const result = await rentalService.getAllRentals();
            expect(result).toBeInstanceOf(Array);
            expect(result.length).toBe(2);
        });

        it('should throw an error if fetching rentals fails', async () => {
            Rental.find = jest.fn().mockRejectedValue(new Error('Database error'));

            await expect(rentalService.getAllRentals()).rejects.toThrow('Database error');
        });
    });

    describe('createRental', () => {
        it('should create a new rental successfully', async () => {
            const rentalData = {
                customerName: 'John Doe',
                rentalDate: '2025-01-01',
                returnDate: '2025-01-05',
                rentalDuration: '5',
                rentalStatus: 'Rented'
            };
            const rentalImage = { path: 'uploads/rentalImage.jpg' };

            Rental.mockImplementation(() => ({
                save: jest.fn().mockResolvedValue({
                    ...rentalData,
                    rentalImage: rentalImage.path
                })
            }));

            const result = await rentalService.createRental(rentalData, rentalImage);

            expect(result).toEqual({
                ...rentalData,
                rentalImage: 'uploads/rentalImage.jpg'
            });
        });


        it('should throw error when rental status is "Available" and data is not empty', async () => {
            const rentalData = {
                customerName: 'John Doe',
                rentalDate: '2025-01-01',
                returnDate: '2025-01-05',
                rentalDuration: '5',
                rentalStatus: 'Available'
            };
            const rentalImage = { path: 'uploads/rentalImage.jpg' };

            await expect(rentalService.createRental(rentalData, rentalImage)).rejects.toThrow('customerName, rentalDate, returnDate harus kosong dan rentalDuration harus 0 jika status available/maintenance');
        });
    });


    describe('updateRentalById', () => {
        it('should update rental data successfully', async () => {
            const rentalId = '12345';
            const rentalData = {
                customerName: 'Jane Doe',
                rentalDate: '2025-02-01',
                returnDate: '2025-02-05',
                rentalDuration: '4',
                rentalStatus: 'Rented'
            };
            const rentalImage = { path: 'uploads/updatedRentalImage.jpg' };

            Rental.findByIdAndUpdate = jest.fn().mockResolvedValue({ ...rentalData, rentalImage: rentalImage.path });

            const result = await rentalService.updateRentalById(rentalId, rentalData, rentalImage);
            expect(result).toHaveProperty('customerName', 'Jane Doe');
            expect(result).toHaveProperty('rentalImage', 'uploads/updatedRentalImage.jpg');
        });

        it('should throw error when rental status is "Available" and data is not empty', async () => {
            const rentalId = '12345';
            const rentalData = {
                customerName: 'Jane Doe',
                rentalDate: '2025-02-01',
                returnDate: '2025-02-05',
                rentalDuration: '4',
                rentalStatus: 'Available'
            };
            const rentalImage = { path: 'uploads/rentalImage.jpg' };

            await expect(rentalService.updateRentalById(rentalId, rentalData, rentalImage)).rejects.toThrow('customerName, rentalDate, returnDate harus kosong dan rentalDuration harus 0 jika status available/maintenance');
        });

        it('should throw an error if updating rental fails', async () => {
            const mockRentalId = '123';
            Rental.findByIdAndUpdate = jest.fn().mockRejectedValue(new Error('Database error'));

            await expect(rentalService.updateRentalById(mockRentalId, { name: 'Updated Rental' }))
                .rejects.toThrow('Database error');
        });
    });

    describe('deleteRentalById', () => {
        it('should delete a rental by ID', async () => {
            const rentalId = '12345';

            Rental.findByIdAndDelete = jest.fn().mockResolvedValue({ _id: rentalId });

            const result = await rentalService.deleteRentalById(rentalId);
            expect(result).toHaveProperty('_id', rentalId);
        });

        it('should throw an error if deleting rental fails', async () => {
            const mockRentalId = '123';
            Rental.findByIdAndDelete = jest.fn().mockRejectedValue(new Error('Database error'));

            await expect(rentalService.deleteRentalById(mockRentalId)).rejects.toThrow(
                'Database error'
            );
        });
    });
});

describe('Multer Configuration Tests', () => {
    const multerConfig = require('../../src/services/rentalService').upload;

    it('should set the correct storage destination and filename', () => {
        const req = {};
        const file = { originalname: 'image.png' };
        const cb = jest.fn();

        multerConfig.storage.getDestination(req, file, cb);
        expect(cb).toHaveBeenCalledWith(null, 'uploads/');

        multerConfig.storage.getFilename(req, file, cb);
        expect(cb).toHaveBeenCalledWith(null, expect.stringMatching(/\d+\.png$/));
    });

    it('should accept valid image file types', () => {
        const req = {};
        const file = { mimetype: 'image/jpeg', originalname: 'image.jpg' };
        const cb = jest.fn();

        multerConfig.fileFilter(req, file, cb);
        expect(cb).toHaveBeenCalledWith(null, true);
    });

    it('should reject invalid file types', () => {
        const req = {};
        const file = { mimetype: 'application/pdf', originalname: 'file.pdf' };
        const cb = jest.fn();

        multerConfig.fileFilter(req, file, cb);
        expect(cb).toHaveBeenCalledWith(expect.any(Error));
    });
});