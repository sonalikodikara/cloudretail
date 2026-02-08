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

      // Add localStatus for controlled dropdown
      const ordersWithLocalStatus = res.data.map(o => ({
        ...o,
        localStatus: o.status,
      }));

      setOrders(ordersWithLocalStatus);
    } catch (err) {
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
      console.error(err);
    }
  };

  const handleStatusChange = (id, newStatus) => {
    setOrders(prev =>
      prev.map(o =>
        o.id === id ? { ...o, localStatus: newStatus } : o
      )
    );
  };

  const saveStatus = async (id, status) => {
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
    }
  };

  const getProductName = (productId) => {
    const product = products.find(p => p.id === productId);
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
              <th>Update</th>
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
              orders.map(o => (
                <tr key={o.id}>
                  <td>{o.id}</td>
                  <td>{getProductName(o.product_id)}</td>
                  <td>{o.quantity}</td>

                  <td>
                    <span className={`status-badge status-${o.status.toLowerCase()}`}>
                      {o.status}
                    </span>
                  </td>

                  <td className="actions-cell">
                    <select
                      value={o.localStatus}
                      onChange={(e) =>
                        handleStatusChange(o.id, e.target.value)
                      }
                      className={`status-select status-${o.localStatus.toLowerCase()}`}
                    >
                      <option value="CREATED">CREATED</option>
                      <option value="CONFIRMED">CONFIRMED</option>
                      <option value="SHIPPED">SHIPPED</option>
                      <option value="DELIVERED">DELIVERED</option>
                      <option value="CANCELLED">CANCELLED</option>
                    </select>

                    <button
                      className="save-btn"
                      onClick={() => saveStatus(o.id, o.localStatus)}
                      disabled={o.localStatus === o.status}
                    >
                      Save
                    </button>
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
