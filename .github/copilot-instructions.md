# Copilot Instructions (CloudRetail)

## Architecture Overview
- This repo is a microservices stack with an API gateway and multiple Laravel services.
- API gateway (Node/Express) lives in `api-gateway/` and proxies to services.
- Services (Laravel): `user-service/`, `product-service/`, `order-service/`, `notification-service/`.
- Frontend (Vite/React) lives in `frontend/`.

## Service Boundaries
- **API Gateway**
  - Proxies all client traffic.
  - Public routes: `POST /api/login`, `POST /api/users/login` -> user service.
  - Protected routes (Bearer token required):
    - `/api/users/*` -> user service
    - `/api/products/*` -> product service
    - `/api/orders/*` -> order service
    - `/api/notifications/*` -> notification service
  - For debugging, add logging in `api-gateway/src/routes/gatewayRoutes.js`.

- **User Service**
  - Auth via Sanctum; login at `POST /api/login`.
  - Token validation at `GET /api/validate-token`.
  - Profile at `GET /api/profile`.

- **Product Service**
  - Product APIs: `GET/POST /api/products`, `PUT /api/products/{id}`.
  - Internal stock update: `POST /api/inventory/update` (used by order service).

- **Order Service**
  - Order APIs: `POST /api/orders`, `GET /api/orders/{id}`, `PUT /api/orders/{id}/status`.
  - Calls product service to reduce stock, then calls notification service.

- **Notification Service**
  - Notify endpoint: `POST /api/notify`.

## Integration Expectations
- The API gateway should be the only public entry point for client traffic.
- Services trust the gateway to pass a valid Bearer token for protected routes.
- When proxying JSON, ensure request bodies are forwarded correctly and do not leave stale `Content-Length` headers.

## Safe Changes
- Prefer changes in the gateway for cross-service routing or proxy behavior.
- Avoid changing service routes without updating the gateway mappings and any frontend API clients.

## Common Pitfalls
- Make sure gateway route paths match service routes (no extra path segments).
- When testing, use the gateway URLs instead of service URLs to validate auth and routing.
