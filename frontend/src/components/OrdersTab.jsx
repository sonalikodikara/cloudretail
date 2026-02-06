import { useEffect, useState } from "react";
import axios from "axios";
import API from "../config/api";
import "../styles/orders-tab.css";

export default function OrdersTab() {
  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState([]);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");
  const token = localStorage.getItem("token");

  useEffect(() => {
    fetchOrders();
    fetchProducts();
  }, []);

  const fetchOrders = async () => {
    try {
      const res = await axios.get(API.ORDERS.LIST, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setOrders(res.data);
    } catch (err) {
      console.error("Failed to fetch orders", err);
      setMessage("Failed to load orders");
      setMessageType("error");
    }
  };

  const fetchProducts = async () => {
    try {
      const res = await axios.get(API.PRODUCTS.LIST, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setProducts(res.data);
    } catch (err) {
      console.error("Failed to fetch products", err);
    }
  };

  const updateStatus = async (id, status) => {
    try {
      await axios.put(
        API.ORDERS.UPDATE_STATUS(id),
        { status },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setMessage("Order status updated successfully");
      setMessageType("success");
      fetchOrders();
    } catch (err) {
      setMessage("Failed to update order status");
      setMessageType("error");
      console.error(err);
    }
  };

  const getProductName = (productId) => {
    const product = products.find((p) => p.id === productId);
    return product ? product.name : productId;
  };

  return (
    <div className="orders-tab">
      <h2 className="tab-title">Orders</h2>

      {message && (
        <div className={`message ${messageType}`}>
          {message}
        </div>
      )}

      <div className="table-container">
        <table className="orders-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Product</th>
              <th>Qty</th>
              <th>Status</th>
              <th>Update Status</th>
            </tr>
          </thead>
          <tbody>
            {orders.length === 0 ? (
              <tr>
                <td colSpan={5} className="empty-state">
                  No orders found
                </td>
              </tr>
            ) : (
              orders.map((o) => (
                <tr key={o.id}>
                  <td>{o.id}</td>
                  <td>{getProductName(o.product_id)}</td>
                  <td>{o.quantity}</td>
                  <td className={`status-badge status-${o.status.toLowerCase()}`}>
                    {o.status}
                  </td>
                  <td className="actions-cell">
                    <select
                      value={o.status}
                      onChange={(e) => updateStatus(o.id, e.target.value)}
                      className="status-select"
                    >
                      <option value="CREATED">CREATED</option>
                      <option value="CONFIRMED">CONFIRMED</option>
                      <option value="SHIPPED">SHIPPED</option>
                      <option value="DELIVERED">DELIVERED</option>
                      <option value="CANCELLED">CANCELLED</option>
                    </select>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}