jest.mock('../../src/models/Shift', () => {
    return jest.fn().mockImplementation(() => ({
        save: jest.fn(),
    }));
});

const shiftService = require('../../src/services/shiftService');
const Shift = require('../../src/models/Shift');

describe('Shift Service', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('validateFormat', () => {
        it('should throw an error for invalid shift start or end time format', async () => {
            const invalidShiftData = {
                shiftStart: '25:00',  // Invalid time
                shiftEnd: '17:00',
                employeeIds: ['emp1'],
                startDate: '2025-01-01',
                endDate: '2025-01-01',
                shiftType: 'Morning',
                notes: 'Test invalid time format'
            };

            await expect(shiftService.createShift(invalidShiftData)).rejects.toThrow(
                'Invalid time format for shiftStart or shiftEnd'
            );
        });
    })

    describe('validateDateRange', () => {
        it('should throw an error if endDate is before startDate', async () => {
            const invalidDateRangeData = {
                shiftStart: '09:00',
                shiftEnd: '17:00',
                employeeIds: ['emp1'],
                startDate: '2025-01-02',
                endDate: '2025-01-01',  // Invalid date range
                shiftType: 'Morning',
                notes: 'Test invalid date range'
            };

            await expect(shiftService.createShift(invalidDateRangeData)).rejects.toThrow(
                'endDate cannot be before startDate'
            );
        });
    })

    describe('createShift', () => {
        it('should create shifts successfully for valid input', async () => {
            const mockShiftData = {
                shiftStart: '09:00',
                shiftEnd: '17:00',
                employeeIds: ['emp1'],
                startDate: '2025-01-01',
                endDate: '2025-01-02',
                shiftType: 'Morning',
                notes: 'Regular shift',
            };

            Shift.findOne = jest.fn().mockResolvedValue(null);
            Shift.mockImplementation(() => ({
                save: jest.fn().mockResolvedValue({ ...mockShiftData, id: 'shift1' }),
            }));

            const result = await shiftService.createShift(mockShiftData);

            expect(result).toHaveLength(2); // Two days of shifts
            expect(Shift.findOne).toHaveBeenCalledTimes(2);
            expect(Shift).toHaveBeenCalled();
        });

        it('should throw an error if a shift already exists for a day', async () => {
            const mockShiftData = {
                shiftStart: '09:00',
                shiftEnd: '17:00',
                employeeIds: ['emp1'],
                startDate: '2025-01-01',
                endDate: '2025-01-02',
                shiftType: 'Morning',
                notes: 'Regular shift',
            };

            Shift.findOne = jest.fn().mockResolvedValue({});

            await expect(shiftService.createShift(mockShiftData)).rejects.toThrow(
                'User with ID emp1 already has a shift on 2025-01-01'
            );
        });

        it('should throw an error for invalid time format', async () => {
            const mockShiftData = {
                shiftStart: 'invalid-time',
                shiftEnd: '17:00',
                employeeIds: ['emp1'],
                startDate: '2025-01-01',
                endDate: '2025-01-02',
                shiftType: 'Morning',
                notes: 'Regular shift',
            };

            await expect(shiftService.createShift(mockShiftData)).rejects.toThrow(
                'Invalid time format for shiftStart or shiftEnd'
            );
        });
    });

    describe('getAllShifts', () => {
        it('should fetch all shifts successfully', async () => {
            const mockShifts = [{ shiftType: 'Morning' }, { shiftType: 'Afternoon' }];

            Shift.find = jest.fn().mockReturnValue({
                populate: jest.fn().mockResolvedValue(mockShifts),
            });

            const shifts = await shiftService.getAllShifts();

            expect(shifts).toEqual(mockShifts);
            expect(Shift.find).toHaveBeenCalledTimes(1);
            expect(Shift.find().populate).toHaveBeenCalledWith('employeeIds', 'name email');
        });

        it('should throw an error if fetching shifts fails', async () => {
            Shift.find = jest.fn().mockReturnValue({
                populate: jest.fn().mockRejectedValue(new Error('Database error')),
            });

            await expect(shiftService.getAllShifts()).rejects.toThrow(
                'Error fetching all shifts: Database error'
            );
        });
    });

    describe('getShiftById', () => {
        it('should fetch a shift by ID successfully', async () => {
            const mockShift = { id: 'shift1', shiftType: 'Morning' };

            // Membuat objek query yang memmock populate dengan chainable mock function
            const mockQuery = {
                populate: jest.fn().mockResolvedValue(mockShift), // mock populate untuk mengembalikan mockShift
            };

            // Mock Shift.findById agar mengembalikan objek query dengan populate
            Shift.findById = jest.fn().mockReturnValue(mockQuery);

            const shift = await shiftService.getShiftById('shift1');

            expect(shift).toEqual(mockShift);
            expect(Shift.findById).toHaveBeenCalledWith('shift1');
            expect(mockQuery.populate).toHaveBeenCalledWith('employeeIds', 'name email');
        });

        it('should throw an error if fetching shift by ID fails', async () => {
            const mockQuery = {
                populate: jest.fn().mockRejectedValue(new Error('Database error')),
            };

            Shift.findById = jest.fn().mockReturnValue(mockQuery);

            await expect(shiftService.getShiftById('shift1')).rejects.toThrow(
                'Error fetching shift by ID: Database error'
            );
        });
    });

    describe('updateShift', () => {
        it('should update a shift successfully', async () => {
            const mockShiftData = {
                shiftStart: '10:00',
                shiftEnd: '18:00',
                employeeIds: ['emp1'],
                startDate: '2025-01-01',
                endDate: '2025-01-01',
                shiftType: 'Morning',
                notes: 'Updated shift'
            };

            const mockExistingShift = {
                id: 'shift1',
                employeeIds: ['emp1'],
                startDate: '2025-01-01',
                endDate: '2025-01-02',
                shiftStart: '09:00',
                shiftEnd: '17:00',
                shiftType: 'Morning',
                notes: 'Regular shift',
                save: jest.fn().mockResolvedValue(true),
            };

            const mockSavedShift = {
                id: 'shift1',
                employeeIds: ['emp1'],
                startDate: '2025-01-01',
                endDate: '2025-01-01',
                shiftStart: '10:00',
                shiftEnd: '18:00',
                shiftType: 'Morning',
                notes: 'Updated shift'
            };

            // Mock method calls
            Shift.findById = jest.fn().mockResolvedValue(mockExistingShift);
            Shift.findOne = jest.fn().mockResolvedValue(null);  // No conflicting shift found
            Shift.deleteOne = jest.fn().mockResolvedValue(true); // Simulate deleting the old shift
            mockExistingShift.save.mockResolvedValue(mockSavedShift); // Simulate saving the updated shift

            const updatedShifts = await shiftService.updateShift('shift1', mockShiftData);

            // Verifying the updated shift
            expect(updatedShifts).toEqual([mockSavedShift]);
            expect(Shift.findById).toHaveBeenCalledWith('shift1');
            expect(Shift.deleteOne).toHaveBeenCalledWith({
                employeeIds: { $in: mockExistingShift.employeeIds },
                startDate: '2025-01-02',
                _id: 'shift1'
            });
            expect(mockExistingShift.save).toHaveBeenCalledTimes(1); // Only one shift should be saved
        });

        it('should throw an error if an employee already has another shift on the same day', async () => {
            const mockShiftData = {
                shiftStart: '10:00',
                shiftEnd: '18:00',
                employeeIds: ['emp1'],
                startDate: '2025-01-01',
                endDate: '2025-01-03',
                shiftType: 'Morning',
                notes: 'Updated shift'
            };

            const mockExistingShift = {
                id: 'shift1',
                employeeIds: ['emp1'],
                startDate: '2025-01-01',
                endDate: '2025-01-01',
                shiftStart: '09:00',
                shiftEnd: '17:00',
                shiftType: 'Morning',
                notes: 'Regular shift',
                save: jest.fn().mockResolvedValue(true),
            };

            const mockConflictingShift = {
                id: 'shift2',
                employeeIds: ['emp1'],
                startDate: '2025-01-01',
                endDate: '2025-01-01',
                shiftStart: '08:00',
                shiftEnd: '16:00',
                shiftType: 'Morning',
                notes: 'Conflict shift',
            };

            // Mock method calls
            Shift.findById = jest.fn().mockResolvedValue(mockExistingShift);
            Shift.findOne = jest.fn().mockResolvedValue(mockConflictingShift); // Conflict shift found
            Shift.save = jest.fn().mockResolvedValue(mockExistingShift);

            await expect(shiftService.updateShift('shift1', mockShiftData)).rejects.toThrow(
                'User with ID emp1 already has another shift on 2025-01-01'
            );
        });

        it('should throw an error if shift not found', async () => {
            const mockShiftData = {
                shiftStart: '10:00',
                shiftEnd: '18:00',
                employeeIds: ['emp1'],
                startDate: '2025-01-01',
                endDate: '2025-01-03',
                shiftType: 'Morning',
                notes: 'Updated shift'
            };

            // Mock method calls
            Shift.findById = jest.fn().mockResolvedValue(null); // No shift found with the given ID

            await expect(shiftService.updateShift('shift1', mockShiftData)).rejects.toThrow(
                'Shift not found'
            );
        });

        it('should throw an error if invalid time format is provided', async () => {
            const mockShiftData = {
                shiftStart: '10:00',
                shiftEnd: 'invalid-time', // Invalid time format
                employeeIds: ['emp1'],
                startDate: '2025-01-01',
                endDate: '2025-01-01',
                shiftType: 'Morning',
                notes: 'Updated shift'
            };

            await expect(shiftService.updateShift('shift1', mockShiftData)).rejects.toThrow(
                'Invalid time format for shiftEnd'
            );
        });

        it('should throw an error if invalid date range is provided', async () => {
            const mockShiftData = {
                shiftStart: '10:00',
                shiftEnd: '18:00',
                employeeIds: ['emp1'],
                startDate: '2025-01-03',
                endDate: '2025-01-02', // Invalid date range
                shiftType: 'Morning',
                notes: 'Updated shift'
            };

            await expect(shiftService.updateShift('shift1', mockShiftData)).rejects.toThrow(
                'endDate cannot be before startDate'
            );
        });

        it('should create new shifts and update existing shifts correctly', async () => {
            const mockShiftData = {
                shiftStart: '10:00',
                shiftEnd: '18:00',
                employeeIds: ['emp1'],
                startDate: '2025-01-02', // Rentang baru
                endDate: '2025-01-03',   // Rentang baru
                shiftType: 'Morning',
                notes: 'New shift'
            };

            // Mock shift lama dengan rentang tanggal yang berbeda
            const mockExistingShift = {
                id: 'shift1',
                employeeIds: ['emp1'],
                startDate: '2025-01-01', // Rentang lama
                endDate: '2025-01-02',   // Rentang lama
                shiftStart: '09:00',
                shiftEnd: '17:00',
                shiftType: 'Morning',
                notes: 'Regular shift',
                save: jest.fn().mockResolvedValue(true), // Mock save untuk shift yang diperbarui
            };

            // Mock fungsi database
            Shift.findById = jest.fn().mockResolvedValue(mockExistingShift); // Mendapatkan shift lama
            Shift.findOne = jest.fn().mockResolvedValue(null); // Tidak ada shift yang konflik
            Shift.deleteOne = jest.fn().mockResolvedValue(true); // Menghapus shift lama

            // Mock instance baru dari Shift untuk shift baru
            const mockShiftInstance = {
                save: jest.fn().mockResolvedValue(true), // Mock fungsi save untuk shift baru
            };

            // Mock konstruktor Shift untuk mengembalikan mockShiftInstance
            Shift.mockImplementation(() => mockShiftInstance);

            // Melakukan update shift
            const updatedShifts = await shiftService.updateShift('shift1', mockShiftData);

            // **1. Verifikasi bahwa Shift.deleteOne hanya dipanggil untuk tanggal yang tidak ada di rentang baru**
            expect(Shift.deleteOne).toHaveBeenCalledTimes(1);
            expect(Shift.deleteOne).toHaveBeenCalledWith({
                _id: "shift1",
                employeeIds: { "$in": ["emp1"] },
                startDate: "2025-01-01"
            });

            // **2. Verifikasi bahwa shift lama diperbarui dengan data baru**
            expect(mockExistingShift.save).toHaveBeenCalledTimes(1);
            expect(mockExistingShift.shiftStart).toBe('10:00');
            expect(mockExistingShift.shiftEnd).toBe('18:00');
            expect(mockExistingShift.shiftType).toBe('Morning');
            expect(mockExistingShift.notes).toBe('New shift');
            expect(mockExistingShift.startDate).toBe('2025-01-01');
            expect(mockExistingShift.endDate).toBe('2025-01-02');

            // **3. Verifikasi bahwa shift baru dibuat untuk tanggal 2025-01-03**
            expect(Shift).toHaveBeenCalledTimes(1); // Hanya satu shift baru yang dibuat
            expect(mockShiftInstance.save).toHaveBeenCalledTimes(1);

            // **4. Verifikasi bahwa hasil `updatedShifts` berisi shift yang benar**
            expect(updatedShifts).toEqual([
                expect.objectContaining({
                    startDate: '2025-01-02',
                    endDate: '2025-01-02',
                    shiftStart: '10:00',
                    shiftEnd: '18:00',
                    employeeIds: ['emp1'],
                    shiftType: 'Morning',
                    notes: 'New shift'
                }),
                expect.objectContaining({
                    startDate: '2025-01-03',
                    endDate: '2025-01-03',
                    shiftStart: '10:00',
                    shiftEnd: '18:00',
                    employeeIds: ['emp1'],
                    shiftType: 'Morning',
                    notes: 'New shift'
                })
            ]);
        });
    });

    describe('deleteShift', () => {
        it('should delete a shift successfully', async () => {
            const mockDeletedShift = { id: 'shift1', shiftType: 'Morning' };

            // Mock the Shift.findByIdAndDelete method
            Shift.findByIdAndDelete = jest.fn().mockResolvedValue(mockDeletedShift);

            // Call the deleteShift method
            const result = await shiftService.deleteShift('shift1');

            // Assertions
            expect(result).toEqual(mockDeletedShift);
            expect(Shift.findByIdAndDelete).toHaveBeenCalledWith('shift1');
        });

        it('should throw an error if deleting shift fails', async () => {
            // Mock the Shift.findByIdAndDelete method to simulate an error
            Shift.findByIdAndDelete = jest.fn().mockRejectedValue(new Error('Database error'));

            // Call the deleteShift method and expect an error to be thrown
            await expect(shiftService.deleteShift('shift1')).rejects.toThrow(
                'Error deleting shift: Database error'
            );
        });
    });

});