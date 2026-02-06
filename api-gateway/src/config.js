import dotenv from "dotenv";
dotenv.config();

export const config = {
  port: Number(process.env.PORT || 9000),
  services: {
    user: process.env.USER_SERVICE || "http://localhost:8001",
    product: process.env.PRODUCT_SERVICE || "http://localhost:8002",
    order: process.env.ORDER_SERVICE || "http://localhost:8003",
    notification: process.env.NOTIFICATION_SERVICE || "http://localhost:8004",
  },
  corsOrigins: (process.env.CORS_ORIGINS || "")
    .split(",")
    .map(s => s.trim())
    .filter(Boolean),
};
