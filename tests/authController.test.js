const request = require('supertest');
const express = require('express');
const session = require('express-session');
const User = require('../models/user');
const routes = require('../routes/userRoutes');

// Mock dependencies
jest.mock('../models/user');
jest.mock('../middleware/authMiddleware', () => jest.fn((req, res, next) => next()));

function createTestApp() {
  const app = express();
  app.use(express.json());
  app.use(session({
    secret: 'testsecret',
    resave: false,
    saveUninitialized: true,
    cookie: { secure: true }
  }));
  app.use(routes);
  return app;
}

describe('AuthController', () => {
  let app;
  let agent;

  beforeAll(() => {
    app = createTestApp();
    agent = request.agent(app);
  });

  beforeEach(() => {
    jest.resetAllMocks();
    User.findOne.mockResolvedValue(null);
    User.prototype.save.mockResolvedValue();
  });

  describe('Registration', () => {
    const registrationUrl = '/api/register';

    const registrationTestCases = [
      {
        description: 'reject registration with missing fields',
        userData: {
          email: 'newuser@example.com',
          confirmPassword: 'password',
          age: 30,
          weight: 80,
          weightUnit: 'kg',
          height: 175,
          heightUnit: 'cm',
          fitnessLevel: 'intermediate',
          fitnessGoal: 'build muscle'
        },
        expectedStatus: 400,
        expectedMessage: 'Missing fields: password.'
      },
      {
        description: 'reject registration with existing user',
        setup: () => User.findOne.mockResolvedValue({ email: 'existing@example.com' }),
        userData: {
          email: 'existing@example.com',
          password: 'password',
          confirmPassword: 'password',
          age: 25,
          weight: 70,
          weightUnit: 'kg',
          height: 180,
          heightUnit: 'cm',
          fitnessLevel: 'beginner',
          fitnessGoal: 'strength'
        },
        expectedStatus: 400,
        expectedMessage: 'User already exists.'
      },
      {
        description: 'reject registration with password mismatch',
        userData: {
          email: 'newuser@example.com',
          password: 'password1',
          confirmPassword: 'password2',
          age: 30,
          weight: 80,
          weightUnit: 'kg',
          height: 175,
          heightUnit: 'cm',
          fitnessLevel: 'intermediate',
          fitnessGoal: 'strength'
        },
        expectedStatus: 400,
        expectedMessage: 'Passwords do not match.'
      },
      {
        description: 'reject registration with invalid weight',
        userData: {
          email: 'test@example.com',
          password: 'password',
          confirmPassword: 'password',
          age: 30,
          weight: 700,
          weightUnit: 'kg',
          height: 175,
          heightUnit: 'cm',
          fitnessLevel: 'intermediate',
          fitnessGoal: 'strength'
        },
        expectedStatus: 400,
        expectedMessage: 'Invalid weight.'
      }
    ];

    registrationTestCases.forEach(({ description, userData, expectedStatus, expectedMessage, setup }) => {
      it(description, async () => {
        if (setup) setup();
        const response = await agent.post(registrationUrl).send(userData);
        expect(response.status).toBe(expectedStatus);
        expect(response.body.errorMessage).toBe(expectedMessage);
      });
    });
  });

  describe('Login and Session Management', () => {
    it('should handle successful login and fetch current user data', async () => {
      User.findOne.mockResolvedValue({
        email: 'user@example.com',
        password: 'hashedPassword',
        password: 'hashedPassword',
        comparePassword: jest.fn().mockResolvedValue(true)
      });

      const loginResponse = await agent
        .post('/api/login')
        .send({ email: 'user@example.com', password: 'password', confirmPassword: 'password' });

      expect(loginResponse.status).toBe(200);
    });

    it('should reject login attempt with nonexistent user', async () => {
      User.findOne.mockResolvedValue(null);
      const response = await agent
        .post('/api/login')
        .send({ email: 'unknown@example.com', password: 'password', confirmPassword: 'password' });

      expect(response.status).toBe(400);
      expect(response.body.errorMessage).toBe('Invalid email.');
    });

    it('should reject login attempt with incorrect password', async () => {
      User.findOne.mockResolvedValue({
        email: 'user@example.com',
        comparePassword: jest.fn().mockResolvedValue(false)
      });
      const response = await agent
        .post('/api/login')
        .send({ email: 'user@example.com', password: 'wrongpassword', confirmPassword: 'wrongpassword'});

      expect(response.status).toBe(400);
      expect(response.body.errorMessage).toBe('Invalid password.');
    });
  });

  describe('Error Handling', () => {
    it('should handle database failures during registration', async () => {
      User.findOne.mockImplementation(() => Promise.reject(new Error('Database error')));
      const response = await agent
        .post('/api/register')
        .send({
          email: 'newuser@example.com',
          password: 'password',
          confirmPassword: 'password',
          age: 30,
          weight: 80,
          weightUnit: 'kg',
          height: 175,
          heightUnit: 'cm',
          fitnessLevel: 'intermediate',
          fitnessGoal: 'build muscle'
        });
      expect(response.status).toBe(500);
      expect(response.body.errorMessage).toBe('Internal server error');
    });
  });
});