import request from 'supertest';
import app from '../app';

describe('Orders Service Unit Tests', () => {

  it('should create a new order', async () => {
    // First, login to get token
    const loginRes = await request(app)
      .post('/users/login')
      .send({ email: 'admin@example.com', password: 'password123' });

    const token = loginRes.body.token;

    const res = await request(app)
      .post('/orders')
      .set('Authorization', `Bearer ${token}`)
      .send({
        product_id: 1,
        quantity: 2
      });

    expect(res.statusCode).toBe(201);
    expect(res.body).toHaveProperty('id');
  });

  it('should fetch all orders', async () => {
    const res = await request(app)
      .get('/orders');

    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

});
