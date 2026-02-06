import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import API from '../config/api.js';
import '../styles/customer-dashboard.css';

function CustomerDashboard() {
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [productId, setProductId] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState(''); // 'success' | 'error'
  const navigate = useNavigate();
  const token = localStorage.getItem('token');

  useEffect(() => {
    const verifyUser = async () => {
      if (!token) {
        localStorage.clear();
        navigate('/');
        return;
      }

      try {
        const res = await axios.get(API.USERS.PROFILE, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!res.data?.role || res.data.role.toUpperCase() !== 'CUSTOMER') {
          localStorage.clear();
          navigate('/');
        } else {
          fetchProducts();
          fetchOrders();
        }
      } catch (err) {
        console.error('Auth check failed:', err);
        localStorage.clear();
        navigate('/');
      }
    };

    verifyUser();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [navigate, token]);

  const fetchProducts = async () => {
    try {
      const response = await axios.get(API.PRODUCTS.LIST, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setProducts(response.data);
    } catch (err) {
      setMessage('Failed to load products');
      setMessageType('error');
    }
  };

  const fetchOrders = async () => {
    try {
      const response = await axios.get(API.ORDERS.LIST, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setOrders(response.data);
    } catch (err) {
      console.error('Failed to load orders:', err);
    }
  };

  const handleCreateOrder = async (e) => {
    e.preventDefault();
    setMessage('');
    setMessageType('');

    if (!productId) {
      setMessage('Please select a product');
      setMessageType('error');
      return;
    }

    if (quantity < 1) {
      setMessage('Quantity must be at least 1');
      setMessageType('error');
      return;
    }

    try {
      await axios.post(
        API.ORDERS.CREATE,
        { product_id: productId, quantity: Number(quantity) },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setMessage('Order placed successfully!');
      setMessageType('success');
      setProductId('');
      setQuantity(1);
      fetchOrders(); // Refresh orders list
    } catch (err) {
      console.error(err);
      setMessage(err.response?.data?.message || 'Failed to create order');
      setMessageType('error');
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate('/');
  };

  const selectedProduct = products.find(p => p.id === productId);

  return (
    <div className="customer-dashboard">
      <header className="dashboard-header">
        <h1>Customer Dashboard</h1>
        <button className="logout-btn" onClick={handleLogout}>
          Logout
        </button>
      </header>

      <main className="dashboard-content">
        {/* Products Table - Scrollable */}
        <section className="products-section">
          <h2>Available Products</h2>
          <div className="table-container">
            <table className="products-table">
              <thead>
                <tr>
                  <th>Product Name</th>
                  <th>Price</th>
                  <th>Stock</th>
                </tr>
              </thead>
              <tbody>
                {products.length === 0 ? (
                  <tr>
                    <td colSpan={3} className="empty-state">No products available</td>
                  </tr>
                ) : (
                  products.map((product) => (
                    <tr key={product.id}>
                      <td>{product.name}</td>
                      <td>${Number(product.price).toFixed(2)}</td>
                      <td>{product.stock}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>

        {/* Order Form (left) + Orders Table (right) */}
        <div className="order-layout">
          {/* Left - Place Order Form */}
          <section className="order-form-section">
            <h2>Place New Order</h2>

            {message && (
              <div className={`message ${messageType}`}>
                {message}
              </div>
            )}

            <form onSubmit={handleCreateOrder} className="order-form">
              <div className="form-group">
                <label htmlFor="product">Select Product</label>
                <select
                  id="product"
                  value={productId}
                  onChange={(e) => setProductId(e.target.value)}
                  required
                >
                  <option value="">-- Choose a product --</option>
                  {products.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="quantity">Quantity</label>
                <input
                  id="quantity"
                  type="number"
                  min="1"
                  max={selectedProduct ? selectedProduct.stock : 999}
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  required
                />
              </div>

              <button type="submit" className="btn btn-primary" disabled={!productId}>
                Place Order
              </button>
            </form>
          </section>

          {/* Right - My Orders */}
          <section className="orders-section">
            <h2>My Orders</h2>
            <div className="table-container">
              <table className="orders-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Product</th>
                    <th>Qty</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="empty-state">No orders yet</td>
                    </tr>
                  ) : (
                    orders.map((order) => {
                      const product = products.find(p => p.id === order.product_id);
                      return (
                        <tr key={order.id}>
                          <td>{order.id}</td>
                          <td>{product ? product.name : order.product_id}</td>
                          <td>{order.quantity}</td>
                          <td className={`status-${order.status?.toLowerCase() || 'placed'}`}>
                            {order.status || 'PLACED'}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}

export default CustomerDashboard;