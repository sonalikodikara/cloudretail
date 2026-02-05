import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

function AdminDashboard() {
  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState([]);
  const [productId, setProductId] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [message, setMessage] = useState('');
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
        const res = await axios.get('http://localhost:3000/api/users/user', {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.data.role && res.data.role.toUpperCase() !== 'ADMIN') {
          localStorage.clear();
          navigate('/');
        } else {
          fetchOrders();
          fetchProducts();
        }
      } catch (err) {
        localStorage.clear();
        navigate('/');
      }
    };
    verifyUser();
    // eslint-disable-next-line
  }, [navigate, token]);

  const fetchOrders = async () => {
    try {
      const response = await axios.get('http://localhost:3000/api/orders', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setOrders(response.data);
    } catch (err) {
      setMessage('Failed to load orders');
    }
  };

  const fetchProducts = async () => {
    try {
      const response = await axios.get('http://localhost:3000/api/products', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setProducts(response.data);
    } catch (err) {
      setMessage('Failed to load products');
    }
  };

  const handleUpdateInventory = async (e) => {
    e.preventDefault();
    try {
      await axios.post('http://localhost:3000/api/products/inventory/update', { product_id: productId, quantity }, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setMessage('Inventory updated');
      fetchProducts(); // Refresh products
    } catch (err) {
      setMessage('Failed to update inventory');
    }
  };

  return (
    <div>
      <h2>Admin Dashboard</h2>
      <h3>Orders</h3>
      <ul>
        {orders.map((o) => (
          <li key={o.id}>Order #{o.id} - Product: {o.product_id} - Qty: {o.quantity} - Status: {o.status}</li>
        ))}
      </ul>
      <h3>Manage Inventory</h3>
      <form onSubmit={handleUpdateInventory}>
        <select value={productId} onChange={(e) => setProductId(e.target.value)} required>
          <option value="">Select Product</option>
          {products.map((p) => (
            <option key={p.id} value={p.id}>{p.name} (Stock: {p.stock})</option>
          ))}
        </select>
        <input type="number" value={quantity} onChange={(e) => setQuantity(e.target.value)} min="1" required placeholder="Quantity to subtract" />
        <button type="submit">Update Stock</button>
      </form>
      {message && <p>{message}</p>}
      <button onClick={() => { localStorage.clear(); navigate('/'); }}>Logout</button>
    </div>
  );
}

export default AdminDashboard;