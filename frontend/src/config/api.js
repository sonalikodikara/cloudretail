/**
 * API Configuration
 * Centralized configuration for all API endpoints
 * 
 * Environment variables:
 * - VITE_API_URL: Base URL for API Gateway (default: http://localhost:9000)
 */

// Determine API base URL based on environment
const getApiUrl = () => {
  // During development
  if (import.meta.env.DEV) {
    return import.meta.env.VITE_API_URL || "http://localhost:9000";
  }

  // During production - when running in Docker
  if (import.meta.env.PROD) {
    // If accessed from within Docker network (frontend -> api-gateway internally)
    if (typeof window !== "undefined" && window.location.hostname === "localhost") {
      return import.meta.env.VITE_API_URL || "http://localhost:9000";
    }

    // Otherwise use the gateway hostname from environment or fallback
    return import.meta.env.VITE_API_URL || `http://${window.location.hostname}:9000`;
  }

  return "http://localhost:9000";
};

const API_BASE_URL = getApiUrl();

/**
 * API Endpoints
 * All frontend API calls should use these constants
 */
export const API = {
  // Base URL
  BASE_URL: API_BASE_URL,

  // Auth Endpoints
  LOGIN: `${API_BASE_URL}/users/login`,
  LOGIN_ALT: `${API_BASE_URL}/users/login`, // Alternative login endpoint

  // User Endpoints
  USERS: {
    PROFILE: `${API_BASE_URL}/users/profile`,
    VALIDATE_TOKEN: `${API_BASE_URL}/users/validate-token`,
  },

  // Product Endpoints
  PRODUCTS: {
    LIST: `${API_BASE_URL}/products/products`,
    CREATE: `${API_BASE_URL}/products`,
    UPDATE: (id) => `${API_BASE_URL}/products/${id}`,
    INVENTORY_UPDATE: `${API_BASE_URL}/products/inventory/update`,
  },

  // Order Endpoints
  ORDERS: {
    LIST: `${API_BASE_URL}/orders`,
    CREATE: `${API_BASE_URL}/orders`,
    GET: (id) => `${API_BASE_URL}/orders/orders/${id}`,
    UPDATE_STATUS: (id) => `${API_BASE_URL}/orders/orders/${id}/status`,
  },

  // Notification Endpoints
  NOTIFICATIONS: {
    SEND: `${API_BASE_URL}/api/notifications`,
  },
};

/**
 * Helper function to get Authorization header with Bearer token
 */
export const getAuthHeader = () => {
  const token = localStorage.getItem("token");
  if (!token) {
    return {};
  }
  return {
    Authorization: `Bearer ${token}`,
  };
};

/**
 * Helper function for API requests with automatic token handling
 */
export const apiCall = async (method, endpoint, data = null) => {
  const config = {
    method,
    headers: {
      "Content-Type": "application/json",
      ...getAuthHeader(),
    },
  };

  if (data && (method === "POST" || method === "PUT" || method === "PATCH")) {
    config.body = JSON.stringify(data);
  }

  const response = await fetch(endpoint, config);

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: "Unknown error" }));
    throw new Error(error.message || `API Error: ${response.status}`);
  }

  return response.json();
};

export default API;
