# Frontend API Integration - Quick Reference

## API Base URL
- **Development:** `http://localhost:9000`
- **Docker Production:** `http://api-gateway:9000`
- **Configured in:** `frontend/src/config/api.js`

## Using API Endpoints in Components

### Import
```javascript
import API from '../config/api.js';
```

### Login (No Auth Required)
```javascript
await axios.post(API.LOGIN, { email, password });
```

### Get User Profile (Auth Required)
```javascript
await axios.get(API.USERS.PROFILE, {
  headers: { Authorization: `Bearer ${token}` }
});
```

### Get Products (Auth Required)
```javascript
await axios.get(API.PRODUCTS.LIST, {
  headers: { Authorization: `Bearer ${token}` }
});
```

### Create Order (Auth Required)
```javascript
await axios.post(API.ORDERS.CREATE, 
  { product_id: 1, quantity: 5 },
  { headers: { Authorization: `Bearer ${token}` } }
);
```

### Create Product (Admin, Auth Required)
```javascript
await axios.post(API.PRODUCTS.CREATE,
  { name: 'Product Name', price: 99.99, stock: 100 },
  { headers: { Authorization: `Bearer ${token}` } }
);
```

### Update Inventory (Admin, Auth Required)
```javascript
await axios.post(API.PRODUCTS.INVENTORY_UPDATE,
  { product_id: 1, quantity: 10 },
  { headers: { Authorization: `Bearer ${token}` } }
);
```

### Update Order Status (Admin, Auth Required)
```javascript
await axios.put(API.ORDERS.UPDATE_STATUS(orderId),
  { status: 'SHIPPED' },
  { headers: { Authorization: `Bearer ${token}` } }
);
```

## API Endpoints Map

| Endpoint | Method | Auth | Service | Purpose |
|----------|--------|------|---------|---------|
| `/api/login` | POST | ❌ | User | User authentication |
| `/api/users/user` | GET | ✅ | User | Get current user profile |
| `/api/products` | GET | ✅ | Product | List all products |
| `/api/products` | POST | ✅ | Product | Create new product (admin) |
| `/api/products/{id}` | PUT | ✅ | Product | Update product |
| `/api/inventory/update` | POST | ✅ | Product | Update stock |
| `/api/orders` | GET | ✅ | Order | List orders |
| `/api/orders` | POST | ✅ | Order | Create order |
| `/api/orders/{id}` | GET | ✅ | Order | Get order details |
| `/api/orders/{id}/status` | PUT | ✅ | Order | Update order status |
| `/api/notifications` | POST | ✅ | Notification | Send notification |

## Token Management

### Store Token After Login
```javascript
const { token, role } = response.data;
localStorage.setItem('token', token);
localStorage.setItem('role', role);
```

### Get Token for requests
```javascript
const token = localStorage.getItem('token');
const headers = { Authorization: `Bearer ${token}` };
```

### Clear Token on Logout
```javascript
localStorage.removeItem('token');
localStorage.removeItem('role');
navigate('/');
```

## API Gateway Health Check

```bash
curl http://localhost:9000/health
```

Response:
```json
{
  "status": "ok",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "requestId": "unique-id"
}
```

## Troubleshooting

### CORS Error
- Check `api-gateway/.env` CORS_ORIGINS includes your frontend origin
- If developing locally, origins should include `http://localhost:5173`
- If in Docker, should include `http://localhost:80` or `http://localhost`

### 401 Unauthorized Error
- Token is missing or invalid
- Check localStorage has valid token
- Token may have expired (no refresh implemented yet)

### 502 Bad Gateway Error
- Backend service is unavailable
- Ensure all services are running: `docker-compose ps`
- Check service logs: `docker-compose logs <service-name>`

### Service Not Found (404)
- Check the endpoint path matches the API constant
- Verify the backend route exists in the service
- Check gateway routes in `api-gateway/src/routes/gatewayRoutes.js`

## Configuration Files

| File | Purpose | Environment |
|------|---------|-------------|
| `frontend/.env` | Dev API URL | Development |
| `frontend/.env.production` | Prod API URL | Docker/Production |
| `frontend/src/config/api.js` | API endpoints | All |
| `api-gateway/.env` | Gateway config & CORS | All |

## Making Changes

### Add New API Endpoint
1. Add route in backend service
2. Add endpoint constant in `frontend/src/config/api.js`
3. Use in component with `import API from '../config/api.js'`

### Change API Gateway Port
1. Update `PORT` in `api-gateway/.env`
2. Update `VITE_API_URL` in `frontend/.env` and `.env.production`

### Allow New CORS Origin
1. Add origin to `CORS_ORIGINS` in `api-gateway/.env`
2. Format: `http://domain:port`
3. Separate multiple with commas

## Example: Complete Login Flow

```javascript
import { useState } from 'react';
import axios from 'axios';
import API from '../config/api.js';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(API.LOGIN, {
        email,
        password
      });

      const { token, role } = response.data;
      localStorage.setItem('token', token);
      localStorage.setItem('role', role);

      // Redirect based on role
      if (role?.toUpperCase() === 'ADMIN') {
        navigate('/admin-dashboard');
      } else {
        navigate('/customer-dashboard');
      }
    } catch (error) {
      console.error('Login failed:', error.response?.data?.message);
    }
  };

  return (
    <form onSubmit={handleLogin}>
      <input 
        type="email" 
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <input 
        type="password" 
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      <button type="submit">Login</button>
    </form>
  );
}
```

For more details, see [INTEGRATION_SUMMARY.md](./INTEGRATION_SUMMARY.md)
