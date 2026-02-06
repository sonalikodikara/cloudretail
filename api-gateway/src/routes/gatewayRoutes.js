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

// PUBLIC routes (no auth)- USER_SERVICE/api/login
router.use("/api/login", proxyTo(config.services.user));

/**
 * PROTECTED routes (token required)
 * Maps:
 *   /api/products -> PRODUCT_SERVICE/api/products
 *   /api/orders   -> ORDER_SERVICE/api/orders
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

router.use("/api/products", requireAuthHeader, proxyTo(config.services.product));
router.use("/api/orders", requireAuthHeader, proxyTo(config.services.order));

export default router;
