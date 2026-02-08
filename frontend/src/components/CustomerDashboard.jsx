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
  const [cartItems, setCartItems] = useState([]);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState(''); // 'success' | 'error'
  const [isPlacing, setIsPlacing] = useState(false);
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

  const handleCreateOrder = async () => {
    setMessage('');
    setMessageType('');

    if (cartItems.length === 0) {
      setMessage('Add at least one item before placing orders');
      setMessageType('error');
      return;
    }

    setIsPlacing(true);

    try {
      for (const item of cartItems) {
        await axios.post(
          API.ORDERS.CREATE,
          { product_id: item.productId, quantity: item.quantity },
          { headers: { Authorization: `Bearer ${token}` } }
        );
      }

      setMessage('Orders placed successfully!');
      setMessageType('success');
      setCartItems([]);
      fetchProducts();
      fetchOrders(); // Refresh orders list
    } catch (err) {
      console.error(err);
      setMessage(err.response?.data?.message || 'Failed to create order');
      setMessageType('error');
    } finally {
      setIsPlacing(false);
    }
  };

  const handleAddItem = () => {
    setMessage('');
    setMessageType('');

    if (!productId) {
      setMessage('Please select a product');
      setMessageType('error');
      return;
    }

    const qty = Number(quantity);
    if (!Number.isInteger(qty) || qty < 1) {
      setMessage('Quantity must be a whole number greater than 0');
      setMessageType('error');
      return;
    }

    const product = products.find((p) => p.id === Number(productId));
    if (!product) {
      setMessage('Selected product not found');
      setMessageType('error');
      return;
    }

    if (qty > product.stock) {
      setMessage('Quantity exceeds available stock');
      setMessageType('error');
      return;
    }

    const existing = cartItems.find((item) => item.productId === Number(productId));
    if (existing) {
      const nextQty = existing.quantity + qty;
      if (nextQty > product.stock) {
        setMessage('Total quantity exceeds available stock');
        setMessageType('error');
        return;
      }

      setCartItems((prev) =>
        prev.map((item) =>
          item.productId === Number(productId)
            ? { ...item, quantity: nextQty }
            : item
        )
      );
    } else {
      setCartItems((prev) => [
        ...prev,
        {
          productId: Number(productId),
          name: product.name,
          quantity: qty,
        },
      ]);
    }

    setProductId('');
    setQuantity(1);
  };

  const handleRemoveItem = (id) => {
    setCartItems((prev) => prev.filter((item) => item.productId !== id));
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate('/');
  };

  const selectedProduct = products.find(p => p.id === Number(productId));

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

            <form className="order-form" onSubmit={(e) => e.preventDefault()}>
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

              <div className="order-actions">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={handleAddItem}
                  disabled={!productId}
                >
                  Add Item
                </button>
              </div>
            </form>

            <div className="cart-items">
              <h3>Items to Order</h3>
              {cartItems.length === 0 ? (
                <div className="empty-state">No items added yet</div>
              ) : (
                <ul className="cart-list">
                  {cartItems.map((item) => (
                    <li key={item.productId} className="cart-item">
                      <div className="cart-item-info">
                        <span className="cart-item-name">{item.name}</span>
                        <span className="cart-item-qty">Qty: {item.quantity}</span>
                      </div>
                      <button
                        type="button"
                        className="btn btn-tertiary"
                        onClick={() => handleRemoveItem(item.productId)}
                      >
                        Remove
                      </button>
                    </li>
                  ))}
                </ul>
              )}

              <div className="cart-actions">
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={handleCreateOrder}
                  disabled={cartItems.length === 0 || isPlacing}
                >
                  {isPlacing ? 'Placing Orders...' : 'Place Orders'}
                </button>
              </div>
            </div>
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