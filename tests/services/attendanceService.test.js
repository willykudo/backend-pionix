jest.mock('../../src/models/Attendance', () => {
    return jest.fn().mockImplementation(() => ({
        save: jest.fn(),
    }));
});

const attendanceService = require('../../src/services/attendanceService');
const Attendance = require('../../src/models/Attendance');

describe('Attendance Service', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('determineStatus', () => {
        it('should return "Late, Pending" for late check-in and no check-out', () => {
            const checkInTime = new Date('2025-01-01T09:10:00Z');
            const shiftStartTime = new Date('2025-01-01T09:00:00Z');
            const status = attendanceService.determineStatus(checkInTime, null, shiftStartTime, null);

            expect(status).toBe('Late, Pending');
        });

        it('should return "On Time, Underworked" for on-time check-in and early check-out', () => {
            const checkInTime = new Date('2025-01-01T09:00:00Z');
            const checkOutTime = new Date('2025-01-01T17:00:00Z');
            const shiftStartTime = new Date('2025-01-01T09:00:00Z');
            const shiftEndTime = new Date('2025-01-01T18:00:00Z');

            const status = attendanceService.determineStatus(checkInTime, checkOutTime, shiftStartTime, shiftEndTime);
            expect(status).toBe('On Time, Underworked');
        });
    });


    describe('addCheckIn', () => {
        it('should add check-in successfully for valid input', async () => {
            const mockData = {
                employeeId: 'emp1',
                employeeName: 'John Doe',
                shiftStartTime: '2025-01-01T08:00:00',
                shiftEndTime: '2025-01-01T17:00:00',
            };
            const mockImage = { path: 'checkInImagePath' };

            Attendance.findOne = jest.fn().mockResolvedValue(null);
            Attendance.mockImplementation(() => ({
                save: jest.fn().mockResolvedValue({
                    ...mockData,
                    checkInImage: mockImage.path,
                    status: 'On Time, Pending',
                    id: 'attendance1',
                }),
            }));

            const result = await attendanceService.addCheckIn(mockData, mockImage);

            expect(result).toMatchObject({
                ...mockData,
                checkInImage: mockImage.path,
                status: 'On Time, Pending',
                id: 'attendance1',
            });

            expect(Attendance.findOne).toHaveBeenCalledTimes(1);
            expect(Attendance).toHaveBeenCalled();
        });

        it('should return status "Late" if check-in time is after shift start time', async () => {
            const mockData = {
                employeeId: 'emp1',
                employeeName: 'John Doe',
                shiftStartTime: '2025-01-01T08:00:00',
                shiftEndTime: '2025-01-01T17:00:00',
                checkInTime: '2025-01-01T08:30:00',  // Check-in is late
            };
            const mockImage = { path: 'checkInImagePath' };

            Attendance.findOne = jest.fn().mockResolvedValue(null);
            Attendance.mockImplementation(() => ({
                save: jest.fn().mockResolvedValue({
                    ...mockData,
                    checkInImage: mockImage.path,
                    status: 'Late, Pending',
                    id: 'attendance1',
                }),
            }));

            const result = await attendanceService.addCheckIn(mockData, mockImage);

            expect(result.status).toBe('Late, Pending'); // Ensure Late status is set
        });

        it('should throw an error if user has already checked in for today', async () => {
            const mockData = {
                employeeId: 'emp1',
                employeeName: 'John Doe',
                shiftStartTime: '2025-01-01T08:00:00',
                shiftEndTime: '2025-01-01T17:00:00',
            };
            const mockImage = { path: 'checkInImagePath' };

            // Simulate the user has already checked in
            Attendance.findOne = jest.fn().mockResolvedValue({
                employeeId: 'emp1',
                checkInTime: '2025-01-01T09:00:00',
            });

            await expect(attendanceService.addCheckIn(mockData, mockImage)).rejects.toThrow(
                'User has already checked in for today.'
            );
        });
    });

    describe('addCheckOut', () => {
        it('should add check-out successfully for valid input', async () => {
            const mockAttendance = {
                id: 'attendance1',
                employeeId: 'emp1',
                checkInTime: '2025-01-01T09:00:00',
                checkOutTime: null,
                shiftStartTime: '2025-01-01T08:00:00',
                shiftEndTime: '2025-01-01T17:00:00',
                save: jest.fn().mockResolvedValue({
                    id: 'attendance1',
                    employeeId: 'emp1',
                    checkInTime: '2025-01-01T09:00:00',
                    checkOutTime: '2025-01-01T17:00:00',  // Updated checkOutTime
                    shiftStartTime: '2025-01-01T08:00:00',
                    shiftEndTime: '2025-01-01T17:00:00',
                    checkOutImage: 'checkOutImagePath',
                    status: 'On Time, On Time',
                }),
            };
            const mockImage = { path: 'checkOutImagePath' };

            // Mock the findById to return the mockAttendance object
            Attendance.findById = jest.fn().mockResolvedValue(mockAttendance);

            // Call the method
            const result = await attendanceService.addCheckOut('attendance1', mockImage);

            // Check the results
            expect(result.checkOutImage).toBe(mockImage.path);
            expect(result.status).toBe('On Time, On Time');
            expect(Attendance.findById).toHaveBeenCalledWith('attendance1');
            expect(mockAttendance.save).toHaveBeenCalled();
        });

        it('should throw error if attendance not found during check-out', async () => {
            Attendance.findById = jest.fn().mockResolvedValue(null);

            await expect(attendanceService.addCheckOut('attendance1', {})).rejects.toThrow('Attendance not found');
        });

        it('should throw error if user has already checked out', async () => {
            const mockAttendance = {
                id: 'attendance1',
                employeeId: 'emp1',
                checkInTime: '2025-01-01T09:00:00',
                checkOutTime: '2025-01-01T17:00:00',
                shiftStartTime: '2025-01-01T08:00:00',
                shiftEndTime: '2025-01-01T17:00:00',
                save: jest.fn(),
            };
            Attendance.findById = jest.fn().mockResolvedValue(mockAttendance);

            await expect(attendanceService.addCheckOut('attendance1', {})).rejects.toThrow('User has already checked out.');
        });

        it('should correctly update check-out status when check-out time is after shift end', async () => {
            const mockAttendance = {
                id: 'attendance1',
                employeeId: 'emp1',
                checkInTime: '2025-01-01T08:00:00',
                checkOutTime: null,
                shiftStartTime: '2025-01-01T08:00:00',
                shiftEndTime: '2025-01-01T17:00:00',
                save: jest.fn().mockResolvedValue({
                    checkInTime: '2025-01-01T08:00:00',
                    checkOutTime: '2025-01-01T18:00:00', // Updated check-out time
                    checkOutImage: 'checkOutImagePath',
                    status: 'On Time, Overworked', // Overworked status because check-out is after shift end
                }),
            };
            const mockImage = { path: 'checkOutImagePath' };

            Attendance.findById = jest.fn().mockResolvedValue(mockAttendance);

            const result = await attendanceService.addCheckOut('attendance1', mockImage);

            expect(result.checkOutImage).toBe(mockImage.path);
            expect(result.status).toBe('On Time, Overworked');
            expect(mockAttendance.save).toHaveBeenCalled();
        });

    });

    describe('updateAttendance', () => {
        it('should update attendance successfully with valid data and files', async () => {
            const mockAttendance = {
                id: 'attendance1',
                employeeId: 'emp1',
                employeeName: 'John Doe',
                checkInTime: '2025-01-01T08:00:00',
                checkOutTime: '2025-01-01T17:00:00',
                shiftStartTime: '2025-01-01T08:00:00',
                shiftEndTime: '2025-01-01T17:00:00',
                checkInImage: 'oldCheckInImagePath',
                checkOutImage: 'oldCheckOutImagePath',
                status: 'On Time, On Time',
                save: jest.fn().mockResolvedValue({
                    id: 'attendance1',
                    employeeId: 'emp1',
                    checkInTime: '2025-01-01T08:00:00',
                    checkOutTime: '2025-01-01T17:00:00',
                    shiftStartTime: '2025-01-01T08:00:00',
                    shiftEndTime: '2025-01-01T17:00:00',
                    checkInImage: 'newCheckInImagePath',
                    checkOutImage: 'newCheckOutImagePath',
                    employeeName: 'Jane Doe', // Pastikan mock hasil save mengembalikan data yang benar
                    status: 'On Time, On Time',
                }),
            };

            const mockFiles = {
                checkInImage: [{ path: 'newCheckInImagePath' }],
                checkOutImage: [{ path: 'newCheckOutImagePath' }],
            };

            Attendance.findById = jest.fn().mockResolvedValue(mockAttendance);

            const updateData = { employeeName: 'Jane Doe' };
            const result = await attendanceService.updateAttendance('attendance1', updateData, mockFiles);

            expect(result.checkInImage).toBe(mockFiles.checkInImage[0].path);
            expect(result.checkOutImage).toBe(mockFiles.checkOutImage[0].path);
            expect(result.employeeName).toBe('Jane Doe');
            expect(result.status).toBe('On Time, On Time');
            expect(Attendance.findById).toHaveBeenCalledWith('attendance1');
            expect(mockAttendance.save).toHaveBeenCalled();
        });

        it('should throw an error if attendance not found', async () => {
            Attendance.findById = jest.fn().mockResolvedValue(null);

            await expect(
                attendanceService.updateAttendance('attendance1', {}, {})
            ).rejects.toThrow('Attendance not found');
        });

        it('should update only specific fields without overwriting others', async () => {
            const mockAttendance = {
                id: 'attendance1',
                employeeId: 'emp1',
                employeeName: 'John Doe',
                checkInTime: '2025-01-01T08:00:00',
                checkOutTime: null,
                shiftStartTime: '2025-01-01T08:00:00',
                shiftEndTime: '2025-01-01T17:00:00',
                status: 'On Time, Pending',
                save: jest.fn().mockResolvedValue({
                    id: 'attendance1',
                    employeeId: 'emp1',
                    employeeName: 'John Updated',
                    checkInTime: '2025-01-01T08:00:00',
                    checkOutTime: null,
                    shiftStartTime: '2025-01-01T08:00:00',
                    shiftEndTime: '2025-01-01T17:00:00',
                    status: 'On Time, Pending',
                }),
            };

            Attendance.findById = jest.fn().mockResolvedValue(mockAttendance);

            const updateData = { employeeName: 'John Updated' };
            const result = await attendanceService.updateAttendance('attendance1', updateData, {});

            expect(result.employeeName).toBe('John Updated');
            expect(result.checkOutTime).toBe(null); // Ensure checkOutTime was not overwritten
            expect(Attendance.findById).toHaveBeenCalledWith('attendance1');
            expect(mockAttendance.save).toHaveBeenCalled();
        });
    });


    describe('deleteAttendance', () => {
        it('should delete attendance successfully', async () => {
            const mockAttendance = {
                id: 'attendance1',
                employeeId: 'emp1',
                checkInTime: '2025-01-01T09:00:00',
                shiftStartTime: '2025-01-01T08:00:00',
                shiftEndTime: '2025-01-01T17:00:00',
            };

            Attendance.findByIdAndDelete = jest.fn().mockResolvedValue(mockAttendance);

            const result = await attendanceService.deleteAttendance('attendance1');

            expect(Attendance.findByIdAndDelete).toHaveBeenCalledWith('attendance1');
            expect(result).toMatchObject(mockAttendance);
        });

        it('should throw error if attendance not found during delete', async () => {
            Attendance.findByIdAndDelete = jest.fn().mockResolvedValue(null);

            await expect(attendanceService.deleteAttendance('invalidId')).rejects.toThrow('Attendance not found');
        });
    });

    describe('getAllAttendance', () => {
        it('should get all attendance records successfully', async () => {
            const mockAttendanceList = [
                { id: 'attendance1', employeeId: 'emp1', status: 'On Time, Pending' },
                { id: 'attendance2', employeeId: 'emp2', status: 'Late, Pending' },
            ];

            Attendance.find = jest.fn().mockResolvedValue(mockAttendanceList);

            const result = await attendanceService.getAllAttendance();

            expect(result).toEqual(mockAttendanceList);
            expect(Attendance.find).toHaveBeenCalled();
        });
    });

    describe('getAttendanceById', () => {
        it('should get attendance by ID successfully', async () => {
            const mockAttendance = {
                id: 'attendance1',
                employeeId: 'emp1',
                checkInTime: '2025-01-01T09:00:00',
                checkOutTime: null,
                shiftStartTime: '2025-01-01T08:00:00',
                shiftEndTime: '2025-01-01T17:00:00',
                status: 'On Time, Pending',
            };

            Attendance.findById = jest.fn().mockResolvedValue(mockAttendance);

            const result = await attendanceService.getAttendanceById('attendance1');

            expect(result).toEqual(mockAttendance);
            expect(Attendance.findById).toHaveBeenCalledWith('attendance1');
        });

        it('should throw error if attendance not found by ID', async () => {
            Attendance.findById = jest.fn().mockResolvedValue(null);

            await expect(attendanceService.getAttendanceById('attendance1')).rejects.toThrow('Attendance not found');
        });
    });
});

describe('Multer Configuration Tests', () => {
    const multerConfig = require('../../src/services/attendanceService').upload;

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
