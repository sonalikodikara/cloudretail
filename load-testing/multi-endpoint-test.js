import http from 'k6/http';
import { check, sleep } from 'k6';

export let options = {
  stages: [
    { duration: '30s', target: 10 }, // ramp up to 10 users within 30s
    { duration: '1m', target: 20 },  // stay at 20 users for 1 minute
    { duration: '30s', target: 0 },  // test will end here 
  ],
};

export default function () {
  // Login
  const loginRes = http.post('http://localhost:9000/users/login', JSON.stringify({
    email: 'admin@example.com',
    password: 'password123',
  }), { headers: { 'Content-Type': 'application/json' } });

  const token = loginRes.json('token');
  const authHeaders = { headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` } };

  // Check login response for 200 status
  check(loginRes, { 'login 200': (r) => r.status === 200 });

  // Fetch products (HTTP 200 indicates the request was successful)
  const productsRes = http.get('http://localhost:9000/products/products', authHeaders);
  check(productsRes, { 'products 200': (r) => r.status === 200 });

  // Create order
  const orderRes = http.post('http://localhost:9000/orders', JSON.stringify({
    product_id: 1,
    quantity: 1,
  }), authHeaders);
  check(orderRes, { 'order 201': (r) => r.status === 201 });

  // Send notification
  const notifyRes = http.post('http://localhost:9000/notifications', JSON.stringify({
    user_id: 1,
    message: 'This is a test notification',
  }), authHeaders);
  check(notifyRes, { 'notification 200': (r) => r.status === 200 });

  sleep(1);
}
