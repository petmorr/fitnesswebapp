// Mock axios and User model globally
jest.mock('axios');
jest.mock('../models/user');

const axios = require('axios');
const User = require('../models/user');
const workoutController = require('../controllers/workoutController');

describe('WorkoutController', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('fetchExercisesFromAPI', () => {
        it.each([
            ['strength', 'intermediate', { data: [{ name: 'Pushups', muscle: 'chest', sets: 3, reps: 10, weight: 20 }] }],
            ['powerlifting', 'beginner', { data: [{ name: 'Barbell glute bridge', muscle: 'glutes', sets: 1, reps: 15, weight: 0 }] }]
        ])('should fetch exercises based on fitness goal %s and level %s', async (goal, level, mockData) => {
            axios.get.mockResolvedValue(mockData);
            const exercises = await workoutController.fetchExercisesFromAPI(goal, level);
            expect(axios.get).toHaveBeenCalledWith(expect.stringContaining(goal), expect.any(Object));
            expect(exercises).toEqual(expect.arrayContaining([
                expect.objectContaining({ name: expect.any(String) })
            ]));
        });

        it('should handle API call failures', async () => {
            axios.get.mockRejectedValue(new Error('Failed to fetch exercises from API'));
            await expect(workoutController.fetchExercisesFromAPI('strength', 'intermediate'))
                .rejects.toThrow('Failed to fetch exercises from API');
        });
    });

    describe('saveWorkoutDays', () => {
        const testCases = [
            {
                userId: '123',
                workoutDays: ['Monday', 'Wednesday', 'Friday'],
                expected: { success: true }
            },
            {
                userId: '124',
                workoutDays: [],
                expected: { success: false, errorMessage: 'Failed to save workout preferences' },
                setup: () => User.findByIdAndUpdate.mockRejectedValue(new Error('DB Error'))
            }
        ];

        test.each(testCases)('should save workout days for user %p', async ({ userId, workoutDays, expected, setup }) => {
            if (setup) setup();
            const req = { session: { userId }, body: { workoutDays } };
            const res = { json: jest.fn(), status: jest.fn().mockReturnThis() };

            await workoutController.saveWorkoutDays(req, res);

            if (expected.success) {
                expect(res.json).toHaveBeenCalledWith({ success: true });
            } else {
                expect(res.status).toHaveBeenCalledWith(500);
                expect(res.json).toHaveBeenCalledWith({ success: false, errorMessage: expected.errorMessage });
            }
        });
    });

    describe('generateAndUpdateWorkoutPlan', () => {
        // Not working as expected
        // it('should generate and update workout plan successfully', async () => {
        //     const mockUser = {
        //         _id: '123',
        //         fitnessGoal: 'strength',
        //         fitnessLevel: 'intermediate',
        //         workoutDays: ['Monday', 'Wednesday'],
        //         save: jest.fn().mockResolvedValue({})
        //     };
        //     User.findById.mockResolvedValue(mockUser);

        //     const req = { session: { userId: '123' } };
        //     const res = { json: jest.fn(), status: jest.fn().mockReturnThis() };

        //     axios.get.mockResolvedValue({
        //         data: [{ name: 'Pushups', muscle: 'chest', sets: 3, reps: 10, weight: 20 }]
        //     });

        //     await workoutController.generateAndUpdateWorkoutPlan(req, res);

        //     expect(User.findById).toHaveBeenCalledWith('123');
        //     expect(axios.get).toHaveBeenCalled();
        //     expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        //         success: true,
        //         message: 'Workout plan generated and updated successfully',
        //         weeklyWorkoutPlan: expect.any(Array)
        //     }));
        // });

        it('should handle user not found error', async () => {
            User.findById.mockResolvedValue(null);
            const req = { session: { userId: '123' } };
            const res = { json: jest.fn(), status: jest.fn().mockReturnThis() };

            await workoutController.generateAndUpdateWorkoutPlan(req, res);

            expect(User.findById).toHaveBeenCalledWith('123');
            expect(res.status).toHaveBeenCalledWith(404);
            expect(res.json).toHaveBeenCalledWith({
                success: false,
                errorMessage: 'User not found'
            });
        });
    });
});