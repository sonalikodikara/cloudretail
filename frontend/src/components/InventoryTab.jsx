import { useEffect, useState, useRef } from "react";
import axios from "axios";
import API from "../config/api";
import "../styles/inventory-tab.css";

export default function InventoryTab() {
  const [products, setProducts] = useState([]);
  const [form, setForm] = useState({ name: "", stock: "", price: "" });
  const [editingId, setEditingId] = useState(null);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState(""); // success or error
  const token = localStorage.getItem("token");
  const formRef = useRef(null);

  useEffect(() => {
    fetchProducts();
  }, []);

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    setMessageType("");

    try {
      if (editingId) {
        await axios.put(API.PRODUCTS.UPDATE(editingId), form, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setMessage("Product updated successfully");
        setMessageType("success");
      } else {
        await axios.post(API.PRODUCTS.CREATE, form, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setMessage("Product created successfully");
        setMessageType("success");
      }

      setForm({ name: "", stock: "", price: "" });
      setEditingId(null);
      fetchProducts();
    } catch (err) {
      setMessage("Operation failed. Please try again.");
      setMessageType("error");
      console.error(err);
    }
  };

  const handleEdit = (product) => {
    setEditingId(product.id);
    setForm({
      name: product.name,
      stock: product.stock.toString(),
      price: product.price.toString(),
    });
    if (formRef.current) {
      formRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this product?")) return;

    try {
      await axios.delete(API.PRODUCTS.UPDATE(id), {
        headers: { Authorization: `Bearer ${token}` },
      });
      setMessage("Product deleted successfully");
      setMessageType("success");
      fetchProducts();
    } catch (err) {
      setMessage("Failed to delete product");
      setMessageType("error");
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <div className="inventory-tab">
      <h2 className="tab-title">Inventory Management</h2>

      {message && (
        <div className={`message ${messageType}`}>
          {message}
        </div>
      )}

      <form className="inventory-form" onSubmit={handleSubmit} ref={formRef}>
        <div className="form-grid">
          <div className="form-group">
            <label>Product Name</label>
            <input
              type="text"
              name="name"
              placeholder="Enter product name"
              value={form.name}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label>Stock Quantity</label>
            <input
              type="number"
              name="stock"
              placeholder="0"
              min="0"
              value={form.stock}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label>Price ($)</label>
            <input
              type="number"
              name="price"
              placeholder="0.00"
              step="0.01"
              min="0"
              value={form.price}
              onChange={handleChange}
              required
            />
          </div>
        </div>

        <div className="form-actions">
          <button type="submit" className="btn primary">
            {editingId ? "Update Product" : "Create Product"}
          </button>
          {editingId && (
            <button
              type="button"
              className="btn secondary"
              onClick={() => {
                setEditingId(null);
                setForm({ name: "", stock: "", price: "" });
              }}
            >
              Cancel
            </button>
          )}
        </div>
      </form>

      <div className="table-container">
        <table className="products-table">
          <thead>
            <tr>
              <th>Product Name</th>
              <th>Stock</th>
              <th>Price</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {products.length === 0 ? (
              <tr>
                <td colSpan={4} className="empty-state">
                  No products found
                </td>
              </tr>
            ) : (
              products.map((product) => (
                <tr key={product.id}>
                  <td>{product.name}</td>
                  <td>{product.stock}</td>
                  <td>${Number(product.price).toFixed(2)}</td>
                  <td className="actions-cell">
                    <button
                      className="btn action-btn edit"
                      onClick={() => handleEdit(product)}
                    >
                      Edit
                    </button>
                    <button
                      className="btn action-btn delete"
                      onClick={() => handleDelete(product.id)}
                    >
                      Delete
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