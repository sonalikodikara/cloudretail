const express = require('express');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const { createProxyMiddleware } = require('http-proxy-middleware');

const app = express();

// MIDDLEWARE CONFIGURATION
// CORS
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:3000'],
  credentials: true,
}));

// Body parser
app.use(express.json({
  verify: (req, res, buf) => {
    req.rawBody = buf;
  }
}));

// Rate limiting
app.use(rateLimit({
  windowMs: 60 * 1000,
  max: 100,
  message: 'Too many requests from this IP'
}));

// Request logger
app.use((req, res, next) => {
  console.log(`\n  [GATEWAY] ${req.method} ${req.originalUrl}`);
  if (Object.keys(req.body || {}).length) {
    console.log('Request Body:', req.body);
  }
  next();
});

// User service
app.use('/api/users', createProxyMiddleware({
  target: 'http://localhost:8001',
  changeOrigin: true,
  pathRewrite: { '^/api/users': '/api' },

  onProxyReq: (proxyReq, req) => {
    console.log('[USER-SERVICE] Forwarding request to:', proxyReq.path);

    if (req.body && Object.keys(req.body).length) {
      const bodyData = JSON.stringify(req.body);
      proxyReq.setHeader('Content-Type', 'application/json');
      proxyReq.setHeader('Content-Length', Buffer.byteLength(bodyData));
      proxyReq.write(bodyData);
      console.log('Body forwarded to User-Service');
    }
  },

  onProxyRes: (proxyRes) => {
    console.log(`[USER-SERVICE] Response received (Status: ${proxyRes.statusCode})`);
  },

  timeout: 15000,
  proxyTimeout: 15000,

  onError: (err, req, res) => {
    console.error('[USER-SERVICE ERROR]', err.code, err.message);

    if (err.code === 'ECONNREFUSED') {
      return res.status(503).json({
        error: 'User Service Unavailable',
        message: 'User service is not running on port 8001'
      });
    }

    return res.status(502).json({
      error: 'Bad Gateway',
      message: err.message
    });
  },

  logLevel: 'debug'
}));

// PRODUCT SERVICE 
app.use('/api/products', createProxyMiddleware({
  target: 'http://localhost:8002',
  changeOrigin: true,
  pathRewrite: { '^/api/products': '/api' },

  onProxyReq: (proxyReq, req) => {
    console.log('[PRODUCT-SERVICE] Forwarding request');

    if (req.body && Object.keys(req.body).length) {
      const bodyData = JSON.stringify(req.body);
      proxyReq.setHeader('Content-Type', 'application/json');
      proxyReq.setHeader('Content-Length', Buffer.byteLength(bodyData));
      proxyReq.write(bodyData);
    }
  },

  onProxyRes: (proxyRes) => {
    console.log(`[PRODUCT-SERVICE] Response received (${proxyRes.statusCode})`);
  },

  timeout: 5000,
  proxyTimeout: 5000,

  onError: (err, req, res) => {
    console.error('[PRODUCT-SERVICE ERROR]', err.code);
    return res.status(502).json({ error: 'Product Service Error' });
  },

  logLevel: 'debug'
}));

// ORDER SERVICE
app.use('/api/orders', createProxyMiddleware({
  target: 'http://localhost:8003',
  changeOrigin: true,
  pathRewrite: { '^/api/orders': '/api' },

  onProxyReq: (proxyReq, req) => {
    console.log('[ORDER-SERVICE] Forwarding request');

    if (req.body && Object.keys(req.body).length) {
      const bodyData = JSON.stringify(req.body);
      proxyReq.setHeader('Content-Type', 'application/json');
      proxyReq.setHeader('Content-Length', Buffer.byteLength(bodyData));
      proxyReq.write(bodyData);
    }
  },

  onProxyRes: (proxyRes) => {
    console.log(`[ORDER-SERVICE] Response received (${proxyRes.statusCode})`);
  },

  onError: (err, req, res) => {
    console.error('[ORDER-SERVICE ERROR]', err.code);
    return res.status(502).json({ error: 'Order Service Error' });
  },

  logLevel: 'debug'
}));

// NOTIFICATION SERVICE 
app.use('/api/notifications', createProxyMiddleware({
  target: 'http://localhost:8004',
  changeOrigin: true,
  pathRewrite: { '^/api/notifications': '/api' },

  onProxyReq: (proxyReq, req) => {
    console.log('[NOTIFICATION-SERVICE] Forwarding request');

    if (req.body && Object.keys(req.body).length) {
      const bodyData = JSON.stringify(req.body);
      proxyReq.setHeader('Content-Type', 'application/json');
      proxyReq.setHeader('Content-Length', Buffer.byteLength(bodyData));
      proxyReq.write(bodyData);
    }
  },

  onProxyRes: (proxyRes) => {
    console.log(`[NOTIFICATION-SERVICE] Response received (${proxyRes.statusCode})`);
  },

  onError: (err, req, res) => {
    console.error('[NOTIFICATION-SERVICE ERROR]', err.code);
    return res.status(502).json({ error: 'Notification Service Error' });
  },

  logLevel: 'debug'
}));

// HEALTH CHECKS
app.get('/health', (req, res) => {
  console.log('Gateway health check');
  res.json({ status: 'ok', service: 'api-gateway' });
});

// 404 HANDLER
app.use((req, res) => {
  console.warn(`⚠️  Unknown route: ${req.method} ${req.path}`);
  res.status(404).json({
    error: 'Not Found',
    message: `Route ${req.method} ${req.path} does not exist`
  });
});

// START SERVER


const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log('\n====================================');
  console.log(`🚀 API Gateway running on port ${PORT}`);
  console.log('====================================');
  console.log('User Service:         http://localhost:8001');
  console.log('Product Service:      http://localhost:8002');
  console.log('Order Service:        http://localhost:8003');
  console.log('Notification Service: http://localhost:8004\n');
});
