const request = require('supertest');
const app = require('../app'); // Epress app

describe('Auth Service - Login', () => {

  it('should login successfully with valid credentials', async () => {
    const res = await request(app)
      .post('/login')
      .send({
        email: 'admin@example.com',
        password: 'password123'
      });

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('token');
  });

  it('should fail login with wrong password', async () => {
    const res = await request(app)
      .post('/login')
      .send({
        email: 'admin@example.com',
        password: 'wrongpassword'
      });

    expect(res.statusCode).toBe(401);
  });

});
