import http from 'k6/http';
import { check, sleep } from 'k6';

export let options = {
  stages: [
    { duration: '20s', target: 5 },
    { duration: '40s', target: 10 },
    { duration: '20s', target: 0 },
  ],
};

export default function () {
  // Login to get token
  const loginRes = http.post('http://localhost:9000/users/login', JSON.stringify({
    email: 'admin@example.com',
    password: 'password123',
  }), { headers: { 'Content-Type': 'application/json' } });
  
  const token = loginRes.json('token');
  const authHeaders = { headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` } };

  // Create an order
  const orderRes = http.post('http://localhost:9000/orders', JSON.stringify({
    product_id: 1,
    quantity: 1,
  }), authHeaders);

  check(orderRes, { 'order 201': (r) => r.status === 201 });

  sleep(1);
}
