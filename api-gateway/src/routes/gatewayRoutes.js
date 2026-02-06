import { Router } from "express";
import { createProxyMiddleware } from "http-proxy-middleware";
import { config } from "../config.js";

const router = Router();

// helper to create proxy with good defaults
function proxyTo(target) {
  return createProxyMiddleware({
    target,
    changeOrigin: true,
    xfwd: true, 
    proxyTimeout: 30_000, // timeout for proxy is 30 seconds
    timeout: 30_000,

    onProxyReq(proxyReq, req) {
      // Forward request-id to downstream services
      if (req.requestId) proxyReq.setHeader("X-Request-Id", req.requestId);

      // Enforce JSON upstream, keep Content-Type unchanged
      // proxyReq.setHeader("Content-Type", req.headers["content-type"] || "application/json");
    },

    onProxyRes(proxyRes, req, res) {
      res.setHeader("X-Gateway", "node-api-gateway");
    },

    onError(err, req, res) {
      res.status(502).json({
        message: "Service unavailable",
        error: err.message,
        requestId: req.requestId,
      });
    },
  });
}

/**
 * Middleware to require Bearer token in Authorization header
 */
function requireAuthHeader(req, res, next) {
  const auth = req.headers.authorization || "";
  if (!auth.startsWith("Bearer ")) {
    return res.status(401).json({
      message: "Missing/invalid Authorization header (Bearer token required)",
      requestId: req.requestId,
    });
  }
  next();
}

/**
 * PUBLIC routes (no auth)
 * Maps USER_SERVICE /api/* endpoints
 */
// Login endpoint - support both /api/login and /api/users/login
router.post("/api/login", proxyTo(config.services.user));
router.post("/api/users/login", proxyTo(config.services.user));

/**
 * PROTECTED routes (token required)
 * Maps:
 *   /api/users/*     -> USER_SERVICE /api/*     (profile, validate-token, etc.)
 *   /api/products/** -> PRODUCT_SERVICE /api/**  (products list, inventory update, etc.)
 *   /api/orders/**   -> ORDER_SERVICE /api/**    (create, list, update status, etc.)
 *   /api/notifications/** -> NOTIFICATION_SERVICE /api/** 
 */

// User service routes (protected) - profile, validate-token, etc.
router.use("/api/users", requireAuthHeader, proxyTo(config.services.user));

// Product service routes (protected)
router.use("/api/products", requireAuthHeader, proxyTo(config.services.product));

// Order service routes (protected)
router.use("/api/orders", requireAuthHeader, proxyTo(config.services.order));

// Notification service routes (protected)
router.use("/api/notifications", requireAuthHeader, proxyTo(config.services.notification));

export default router;
