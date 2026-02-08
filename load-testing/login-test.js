import http from 'k6/http';
import { check, sleep } from 'k6';

export let options = {
  vus: 10,       // 10 virtual users
  duration: '30s', // run for 30 seconds
};

export default function () {
  const url = 'http://localhost:9000/users/login';

  const payload = JSON.stringify({
    email: 'admin@example.com',
    password: 'password123'
  });

  const params = {
    headers: {
      'Content-Type': 'application/json',
    },
  };

  const res = http.post(url, payload, params);

  check(res, {
    'login status is 200': (r) => r.status === 200,
  });

  sleep(1);
}
