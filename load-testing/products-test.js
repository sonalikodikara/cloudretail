import http from 'k6/http';
import { check, sleep } from 'k6';

export let options = {
  stages: [
    { duration: '20s', target: 5 },
    { duration: '40s', target: 15 },
    { duration: '20s', target: 0 },
  ],
};

export default function () {
  const productsRes = http.get('http://localhost:9000/products/products', {
    headers: { 'Content-Type': 'application/json' },
  });

  check(productsRes, { 'products 200': (r) => r.status === 200 });

  sleep(1);
}
