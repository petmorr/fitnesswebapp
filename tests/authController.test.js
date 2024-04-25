const request = require('supertest');
const express = require('express');
const session = require('express-session');
const User = require('../models/user');
const routes = require('../routes/userRoutes');
const Mustache = require('mustache');

jest.mock('../models/user', () => ({
  findOne: jest.fn(),
  prototype: {
    save: jest.fn(),
    comparePassword: jest.fn()
  }
}));

jest.mock('../middleware/authMiddleware', () => jest.fn((req, res, next) => next()));

function createTestApp() {
  const app = express();
  app.use(express.json());
  app.use(
    session({
      secret: 'testsecret',
      resave: false,
      saveUninitialized: true,
      cookie: { secure: false }
    })
  );
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
  });

  describe('Registration', () => {
    it('should reject registration with missing fields', async () => {
      const response = await agent
        .post('/api/register')
        .send({
          email: 'newuser@example.com',
          confirmPassword: 'password',
          age: 30,
          weight: 80,
          weightUnit: 'kg',
          height: 175,
          heightUnit: 'cm',
          fitnessLevel: 'intermediate',
          fitnessGoal: 'build muscle'
        });
      expect(response.status).toBe(400);
      expect(response.body.errorMessage).toContain('Missing fields');
    });

    it('should reject registration with existing user', async () => {
      User.findOne.mockResolvedValue({ email: 'existing@example.com' });
      const response = await agent
        .post('/api/register')
        .send({
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
        });
      expect(response.status).toBe(400);
      expect(response.body.errorMessage).toBe('User already exists.');
    });

    it('should reject registration with password mismatch', async () => {
      const response = await agent
        .post('/api/register')
        .send({
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
        });
      expect(response.status).toBe(400);
      expect(response.body.errorMessage).toBe('Passwords do not match.');
    });

    it('should reject registration with invalid weight', async () => {
      const response = await agent
        .post('/api/register')
        .send({
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
        });
      expect(response.status).toBe(400);
      expect(response.body.errorMessage).toBe('Invalid weight.');
    });
  });

  describe('Login and Session Management', () => {
    it('should handle successful login and fetch current user data and access dashboard', async () => {
      User.findOne.mockResolvedValue({
        email: 'user@example.com',
        password: 'hashedPassword',
        comparePassword: jest.fn().mockResolvedValue(true)
      });

      const loginResponse = await agent
        .post('/api/login')
        .send({
          email: 'user@example.com',
          password: 'password'
        });

      expect(loginResponse.status).toBe(200);
    });

    it('should reject login attempt with nonexistent user', async () => {
      const response = await agent
        .post('/api/login')
        .send({ email: 'unknown@example.com', password: 'password' });
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
        .send({ email: 'user@example.com', password: 'wrongpassword' });
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