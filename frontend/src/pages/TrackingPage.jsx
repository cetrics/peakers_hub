import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import "./css/TrackingPage.css";

const TrackingPage = () => {
  const { orderNumber } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTracking = async () => {
      try {
        const res = await axios.get(`/api/orders/${orderNumber}/tracking`);
        setOrder(res.data);
      } catch (err) {
        console.error("Error fetching tracking:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchTracking();
  }, [orderNumber]);

  if (loading) return <p>Loading tracking info...</p>;
  if (!order) {
    return (
      <div className="tracking-container">
        <p>⚠️ Order not found.</p>
        <button className="btn" onClick={() => navigate("/order-confirmation")}>
          Back to Orders
        </button>
      </div>
    );
  }

  const steps = ["Ordered", "Shipped", "Out for Delivery", "Delivered"];
  const progressIndex = steps.indexOf(order.current_status);

  return (
    <div className="tracking-container" style={{ "--progress": progressIndex }}>
      <h2>Track Package</h2>
      <p className="delivery-date">
        Estimated delivery: <strong>{order.expected_delivery}</strong>
      </p>

      {/* Progress bar */}
      <div className="tracking-steps">
        {steps.map((step, index) => {
          const isCompleted = progressIndex >= index;
          return (
            <div
              key={step}
              className={`tracking-step ${isCompleted ? "Completed" : ""}`}
            >
              <div className="circle">{isCompleted ? "✓" : index + 1}</div>
              <p>{step}</p>
            </div>
          );
        })}
      </div>

      {/* Shipment updates */}
      <div className="tracking-details">
        <h3>Shipment Updates</h3>
        <ul>
          {order.updates.map((update, i) => (
            <li key={i}>
              <span className="time">
                {new Date(update.update_time).toLocaleString("en-KE", {
                  timeZone: "Africa/Nairobi",
                  hour12: false, // 24-hour format, remove if you want AM/PM
                  year: "numeric",
                  month: "short",
                  day: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </span>

              <span className="text">
                {update.status} - {update.description}
              </span>
            </li>
          ))}
        </ul>
      </div>

      <button className="btn" onClick={() => navigate("/order-confirmation")}>
        Back to Orders
      </button>
    </div>
  );
};

export default TrackingPage;
