import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import API from "../config/api";
import InventoryTab from "./InventoryTab";
import OrdersTab from "./OrdersTab";
import "../styles/admin.css";

function AdminDashboard() {
  const [activeTab, setActiveTab] = useState("inventory");
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  useEffect(() => {
    const verifyUser = async () => {
      if (!token) {
        localStorage.clear();
        navigate("/");
        return;
      }

      try {
        const res = await axios.get(API.USERS.PROFILE, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!res.data?.role || res.data.role.toUpperCase() !== "ADMIN") {
          localStorage.clear();
          navigate("/");
          return;
        }

        setLoading(false);
      } catch (err) {
        console.error("Auth check failed:", err);
        localStorage.clear();
        navigate("/");
      }
    };

    verifyUser();
  }, [navigate, token]);

  if (loading) {
    return <div className="admin-loading">Loading Admin Panel...</div>;
  }

  return (
    <div className="admin-page">
      <header className="admin-header">
        <div className="header-content">
          <h1>CloudRetail Admin Panel</h1>

          <button
            className="logout-btn"
            onClick={() => {
              localStorage.clear();
              navigate("/");
            }}
          >
            Logout
          </button>
        </div>
      </header>

      <main className="admin-main">
        <nav className="tab-nav">
          <button
            className={`tab-btn ${activeTab === "inventory" ? "active" : ""}`}
            onClick={() => setActiveTab("inventory")}
          >
            Manage Inventory
          </button>

          <button
            className={`tab-btn ${activeTab === "orders" ? "active" : ""}`}
            onClick={() => setActiveTab("orders")}
          >
            Orders
          </button>
        </nav>

        <section className="tab-content">
          {activeTab === "inventory" && <InventoryTab />}
          {activeTab === "orders" && <OrdersTab />}
        </section>
      </main>
    </div>
  );
}

export default AdminDashboard;
