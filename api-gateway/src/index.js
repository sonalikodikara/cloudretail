import express from "express";
import { createProxyMiddleware } from "http-proxy-middleware";
import dotenv from "dotenv"; // For loading .env variables
import morgan from "morgan"; // For logging HTTP requests in a standard format
import helmet from "helmet"; // For setting secure HTTP headers
import cors from "cors";
import rateLimit from "express-rate-limit";
import crypto from "crypto";
import http from "http";
import { URL } from "url";

dotenv.config();

const app = express();

const PORT = Number(process.env.PORT || 9000);
const USER_SERVICE = process.env.USER_SERVICE || "http://localhost:8001";
const PRODUCT_SERVICE = process.env.PRODUCT_SERVICE || "http://localhost:8002";
const ORDER_SERVICE = process.env.ORDER_SERVICE || "http://localhost:8003";

const corsOrigins = (process.env.CORS_ORIGINS || "")
  .split(",")
  .map(s => s.trim())
  .filter(Boolean);

// Middleware
app.use(helmet());

// Parse JSON for all incoming requests
app.use(express.json({ limit: "5mb" }));

app.use(
  cors({
    origin: (origin, cb) => {
      if (!origin) return cb(null, true); // allow curl/postman
      if (corsOrigins.length === 0) return cb(null, true);
      return cb(null, corsOrigins.includes(origin));
    },
    credentials: true,
  })
);

// Rate limiting - 100 requests per minute per IP
app.use(
  rateLimit({
    windowMs: 60 * 1000,
    max: 200,
    standardHeaders: true,
    legacyHeaders: false,
  })
);

// request-id
app.use((req, res, next) => {
  const id = req.headers["x-request-id"] || crypto.randomUUID();
  req.requestId = id;
  res.setHeader("X-Request-Id", id);
  next();
});

app.use(morgan(":method :url :status :response-time ms reqId=:req[x-request-id]"));

// health
app.get("/health", (req, res) => {
  res.json({
    status: "ok",
    gatewayTime: new Date().toISOString(),
    requestId: req.requestId,
  });
});

/**
 * Simple HTTP proxy handler - forwards requests to a target service
 */
function createProxy(targetService) {
  return (req, res) => {
    const targetPath = "/api" + req.path;
    const targetURL = new URL(targetPath, targetService);
    
    // Prepare request body
    let bodyData = null;
    if (req.method !== 'GET' && req.method !== 'DELETE' && req.body) {
      bodyData = JSON.stringify(req.body);
    }
    
    const options = {
      hostname: targetURL.hostname,
      port: targetURL.port || (targetURL.protocol === 'https:' ? 443 : 80),
      path: targetURL.pathname + (targetURL.search || ''),
      method: req.method,
      headers: {
        ...req.headers,
        'X-Gateway': 'node-api-gateway',
        'X-Request-Id': req.requestId || crypto.randomUUID(),
      },
      timeout: 30000,
    };
    
    // Update Content-Length if we have a body
    if (bodyData) {
      options.headers['Content-Length'] = Buffer.byteLength(bodyData);
      options.headers['Content-Type'] = 'application/json';
    }
    
    const proxyReq = http.request(options, (proxyRes) => {
      res.writeHead(proxyRes.statusCode, proxyRes.headers);
      proxyRes.pipe(res);
    });
    
    proxyReq.on('error', (err) => {
      console.error(`[PROXY-ERR] Failed to connect to ${targetService}: ${err.message}`);
      if (!res.headersSent) {
        res.status(502).json({
          message: "Service unavailable",
          error: err.message,
          requestId: req.requestId,
        });
      }
    });
    
    proxyReq.on('timeout', () => {
      console.error(`[PROXY-TIMEOUT] Request to ${targetService} timed out`);
      proxyReq.destroy();
      if (!res.headersSent) {
        res.status(504).json({
          message: "Service timeout",
          requestId: req.requestId,
        });
      }
    });
    
    // Write request body if present
    if (bodyData) {
      proxyReq.write(bodyData);
    }
    
    proxyReq.end();
  };
}

/**
 * Middleware to require Bearer token in Authorization header
 */
function requireBearer(req, res, next) {
  const auth = req.headers.authorization || "";
  if (!auth.startsWith("Bearer ")) {
    return res.status(401).json({
      message: "Authorization Bearer token required",
      requestId: req.requestId,
    });
  }
  next();
}

// ---- OLD PROXY FACTORY - NO LONGER USED ----
function makeProxy(target, stripPrefix) {
  return createProxyMiddleware({
    target,
    changeOrigin: true,
    xfwd: true,
    proxyTimeout: 30_000,
    timeout: 30_000,

    /**
     * Rewrite path by stripping prefix
     * Means: /users/*  -> /*
     *        /products/* -> /*
     *        /orders/*  -> /*
     */
    pathRewrite: (path) => {      
      return path.replace(stripPrefix, "");
    },

    onProxyReq: (proxyReq, req) => {
      // forward request id
      if (req.requestId) proxyReq.setHeader("X-Request-Id", req.requestId);

      // keep original host info if needed
      proxyReq.setHeader("X-Gateway", "node-api-gateway");
    },

    onError: (err, req, res) => {
      res.status(502).json({
        message: "Downstream service error",
        error: err.message,
        requestId: req.requestId,
      });
    },
  });
}

/**
 * ROUTING RULES
 *
 * Gateway:   /users/*    -> user-service:    /api/*
 * Gateway:   /products/* -> product-service: /api/products/*  AND /api/invetory/update etc
 * Gateway:   /orders/*   -> order-service:   /api/*
 * This means the gateway prefix decides service, everything after it is the downstream path under /api.
 */

// USER SERVICE - no auth
app.use("/users", createProxy(USER_SERVICE));

// PRODUCT SERVICE 
app.use(
  "/products",
  requireBearer,
  createProxy(PRODUCT_SERVICE)
);

// ORDER SERVICE 
app.use(
  "/orders",
  requireBearer,
  createProxy(ORDER_SERVICE)
);

// fallback
app.use((req, res) => {
  res.status(404).json({
    message: "Gateway route not found",
    hint: "Use /users/*, /products/*, /orders/*",
    requestId: req.requestId,
  });
});

app.listen(PORT, () => {
  console.log(`API Gateway running: http://localhost:${PORT}`);
  console.log("Routes:");
  console.log(`  /users/*    -> ${USER_SERVICE}/api/*`);
  console.log(`  /products/* -> ${PRODUCT_SERVICE}/api/* (requires Bearer)`);
  console.log(`  /orders/*   -> ${ORDER_SERVICE}/api/* (requires Bearer)`);
});
