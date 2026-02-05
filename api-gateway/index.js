const express = require('express');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const { createProxyMiddleware } = require('http-proxy-middleware');

const app = express();

app.use(cors({
  origin: ['http://localhost:5173'],
  credentials: true,
}));

app.use(express.json());

app.use(rateLimit({
  windowMs: 60 * 1000,
  max: 100,
}));

// USER SERVICE
app.use('/api/users', createProxyMiddleware({
  target: 'http://localhost:8001',
  changeOrigin: true,
  pathRewrite: {
    '^/api/users': '/api',
  },
}));

// PRODUCT SERVICE
app.use('/api/products', createProxyMiddleware({
  target: 'http://product-service:8002',
  changeOrigin: true,
  pathRewrite: { '^/api/products': '/api' },
}));

// ORDER SERVICE
app.use('/api/orders', createProxyMiddleware({
  target: 'http://order-service:8003',
  changeOrigin: true,
  pathRewrite: { '^/api/orders': '/api' },
}));

app.listen(3000, () => {
  console.log('API Gateway running on port 3000');
});