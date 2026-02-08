import request from 'supertest';
import app from '../app'; // Express app entry

describe('Products Service Unit Tests', () => {

  it('should return a list of products', async () => {
    const res = await request(app)
      .get('/products/products');

    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  it('should return a single product by ID', async () => {
    const res = await request(app)
      .get('/products/1'); 

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('id', 1);
  });

});
