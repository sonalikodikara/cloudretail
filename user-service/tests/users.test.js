import request from 'supertest';
import app from '../app'; // Express app entry point

describe('Users Service Unit Tests', () => {

  it('should login successfully with valid credentials', async () => {
    const res = await request(app)
      .post('/users/login')
      .send({ email: 'admin@example.com', password: 'password123' });

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('token'); // JWT token returned
  });

  it('should fail login with invalid credentials', async () => {
    const res = await request(app)
      .post('/users/login')
      .send({ email: 'wrong@example.com', password: 'wrongpass' });

    expect(res.statusCode).toBe(401);
    expect(res.body).toHaveProperty('message');
  });

  it('should fetch user profile with valid token', async () => {
    // First, login to get token
    const loginRes = await request(app)
      .post('/users/login')
      .send({ email: 'admin@example.com', password: 'password123' });

    const token = loginRes.body.token;

    const res = await request(app)
      .get('/users/profile')
      .set('Authorization', `Bearer ${token}`);

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('email', 'admin@example.com');
  });

});
