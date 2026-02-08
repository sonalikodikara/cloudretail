import http from 'k6/http';
import { check, sleep } from 'k6';

export let options = {
  stages: [
    { duration: '20s', target: 5 },  // ramp-up
    { duration: '40s', target: 10 }, // sustain
    { duration: '20s', target: 0 },  // ramp-down
  ],
};

export default function () {
  // Login endpoint
  const loginRes = http.post('http://localhost:9000/users/login', JSON.stringify({
    email: 'admin@example.com',
    password: 'password123',
  }), { headers: { 'Content-Type': 'application/json' } });

  check(loginRes, { 'login 200': (r) => r.status === 200 });

  // Optional: fetch profile
  const token = loginRes.json('token');
  const authHeaders = { headers: { Authorization: `Bearer ${token}` } };
  const profileRes = http.get('http://localhost:9000/users/profile', authHeaders);
  check(profileRes, { 'profile 200': (r) => r.status === 200 });

  sleep(1);
}
