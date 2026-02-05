import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

function CustomerDashboard() {
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
        if (res.data.role && res.data.role.toUpperCase() !== 'CUSTOMER') {
          localStorage.clear();
          navigate('/');
        } else {
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

  const handleCreateOrder = async (e) => {
    e.preventDefault();
    try {
      await axios.post('http://localhost:3000/api/orders', { product_id: productId, quantity }, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setMessage('Order created successfully');
    } catch (err) {
      setMessage('Failed to create order');
    }
  };

  return (
    <div>
      <h2>Customer Dashboard</h2>
      <h3>Products</h3>
      <ul>
        {products.map((p) => (
          <li key={p.id}>{p.name} - Stock: {p.stock} - Price: ${p.price}</li>
        ))}
      </ul>
      <h3>Create Order</h3>
      <form onSubmit={handleCreateOrder}>
        <select value={productId} onChange={(e) => setProductId(e.target.value)} required>
          <option value="">Select Product</option>
          {products.map((p) => (
            <option key={p.id} value={p.id}>{p.name}</option>
          ))}
        </select>
        <input type="number" value={quantity} onChange={(e) => setQuantity(e.target.value)} min="1" required />
        <button type="submit">Place Order</button>
      </form>
      {message && <p>{message}</p>}
      <button onClick={() => { localStorage.clear(); navigate('/'); }}>Logout</button>
    </div>
  );
}

export default CustomerDashboard;