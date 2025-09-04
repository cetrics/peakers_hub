// src/pages/OrderDetailsPage.jsx
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import "./css/OrderDetailsPage.css"; // 👈 create this for styling

const OrderDetailsPage = () => {
  const { orderNumber } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const token = localStorage.getItem("adminToken");

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        setLoading(true);
        // ✅ Changed to use order_number instead of id
        const res = await axios.get(`/api/orders/details/${orderNumber}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        setOrder(res.data);
      } catch (err) {
        console.error("Error fetching order:", err);
        setError("Could not load order details.");
      } finally {
        setLoading(false);
      }
    };
    fetchOrder();
  }, [orderNumber, token]);

  if (loading) return <p className="loading">Loading order details...</p>;
  if (error) return <p className="error">{error}</p>;
  if (!order) return <p className="error">Order not found.</p>;

  return (
    <div className="order-details-container">
      <h1 className="page-title">Order #{order.order_number}</h1>

      {/* Order Summary */}
      <section className="order-summary">
        <h2>Order Summary</h2>
        <p>
          <strong>Status:</strong> {order.status}
        </p>
        <p>
          <strong>Placed on:</strong>{" "}
          {new Date(order.created_at).toLocaleString()}
        </p>
        <p>
          <strong>Total:</strong> {order.currency || "KES"} {order.total_amount}
        </p>
        <p>
          <strong>Payment method:</strong> {order.payment_method}
        </p>
        <p>
          <strong>Ship to:</strong> {order.ship_to || "You"}
        </p>
      </section>

      {/* Order Items */}
      <section className="order-items">
        <h2>Items in this order</h2>
        <ul>
          {order.items?.map((item, idx) => (
            <li key={idx} className="order-item">
              {item.image && (
                <img src={item.image} alt={item.title} className="item-image" />
              )}
              <div className="item-info">
                <p className="item-title">{item.title}</p>
                <p className="item-quantity">Qty: {item.quantity}</p>
              </div>
            </li>
          ))}
        </ul>
      </section>

      {/* Actions */}
      <section className="order-actions">
        <button
          className="btn back"
          onClick={() => navigate("/order-confirmation")}
        >
          Back to Orders
        </button>
      </section>
    </div>
  );
};

export default OrderDetailsPage;
