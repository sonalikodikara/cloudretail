import express from "express";
import dotenv from "dotenv";
import morgan from "morgan";
import helmet from "helmet";
import cors from "cors";
import rateLimit from "express-rate-limit";
import crypto from "crypto";
import gatewayRoutes from "./routes/gatewayRoutes.js";

dotenv.config();

const app = express();
const PORT = Number(process.env.PORT || 9000);

// CORS Origins - defaults to allow all origins if empty, can be restricted via env
const corsOrigins = (process.env.CORS_ORIGINS || "")
  .split(",")
  .map(s => s.trim())
  .filter(Boolean);

// Middleware - Security
app.use(helmet());

// CORS Configuration - allows frontend to connect to gateway
app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests without origin (curl, postman, server-to-server)
      if (!origin) {
        return callback(null, true);
      }
      
      // If CORS_ORIGINS env var is empty, allow all origins (development mode)
      if (corsOrigins.length === 0) {
        console.log(`[CORS] Allowing request from ${origin} (no origin restrictions)`);
        return callback(null, true);
      }
      
      // Check if origin is in whitelist
      if (corsOrigins.includes(origin)) {
        return callback(null, true);
      }
      
      console.warn(`[CORS] Rejected request from ${origin}`);
      return callback(new Error("Not allowed by CORS"));
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "X-Request-Id"],
  })
);

// Rate Limiting - 200 requests per minute per IP
app.use(
  rateLimit({
    windowMs: 60 * 1000,
    max: 200,
    standardHeaders: true,
    legacyHeaders: false,
    message: "Too many requests from this IP, please try again later.",
  })
);

// Request ID Middleware - attach unique ID to each request for tracing
app.use((req, res, next) => {
  const id = req.headers["x-request-id"] || crypto.randomUUID();
  req.requestId = id;
  res.setHeader("X-Request-Id", id);
  next();
});

// Logging Middleware
app.use(
  morgan(":method :url :status :response-time ms - requestId=:req[x-request-id]")
);

// Health Check Endpoint
app.get("/health", (req, res) => {
  res.json({
    status: "ok",
    timestamp: new Date().toISOString(),
    requestId: req.requestId,
  });
});

// API Routes
app.use(gatewayRoutes);

// 404 Fallback
app.use((req, res) => {
  res.status(404).json({
    message: "Not found",
    path: req.path,
    hint: "Available routes: /api/login, /api/users/*, /api/products/*, /api/orders/*, /api/notifications/*",
    requestId: req.requestId,
  });
});

// Error Handling Middleware
app.use((err, req, res, next) => {
  console.error("[ERROR]", err.message);
  res.status(500).json({
    message: "Internal server error",
    error: process.env.NODE_ENV === "development" ? err.message : "Server error",
    requestId: req.requestId,
  });
});

// Start Server
app.listen(PORT, () => {
  console.log(`\n API Gateway running on http://localhost:${PORT}`);
  console.log(`\n Available Routes:`);
  console.log(`  Public (no auth):`);
  console.log(`    POST   /api/login`);
  console.log(`    POST   /api/users/login`);
  console.log(`\n  Protected (require Bearer token):`);
  console.log(`    GET    /api/users/user         → User Service`);
  console.log(`    GET    /api/products           → Product Service`);
  console.log(`    POST   /api/products           → Product Service`);
  console.log(`    PUT    /api/products/{id}      → Product Service`);
  console.log(`    POST   /api/inventory/update   → Product Service`);
  console.log(`    GET    /api/orders             → Order Service`);
  console.log(`    POST   /api/orders             → Order Service`);
  console.log(`    PUT    /api/orders/{id}/status → Order Service`);
  console.log(`    POST   /api/notifications/notify → Notification Service`);
  
  if (corsOrigins.length > 0) {
    console.log(`\n CORS Origins allowed:`, corsOrigins.join(", "));
  } else {
    console.log(`\n CORS: All origins allowed (development mode)`);
  }
  console.log();
});

