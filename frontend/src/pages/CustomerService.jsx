import React from "react";
import "./css/CustomerService.css";

const services = [
  {
    title: "Your Orders",
    description:
      "Track, return, or cancel your orders easily from your Peakers Hub account.",
  },
  {
    title: "Returns & Refunds",
    description:
      "Learn how to return items and request refunds for eligible products.",
  },
  {
    title: "Payment Options",
    description:
      "Manage your saved payment methods including M-Pesa, credit, and debit cards.",
  },
  {
    title: "Shipping & Delivery",
    description:
      "Find out about delivery times, shipping fees, and tracking your packages.",
  },
  {
    title: "Account Settings",
    description:
      "Update your account information, password, and notification preferences.",
  },
  {
    title: "Help & Support",
    description:
      "Get answers to frequently asked questions or contact our support team directly.",
  },
];

const CustomerService = () => {
  return (
    <div className="cs-container">
      {/* Hero Section */}
      <div className="cs-hero">
        <h1>Customer Service</h1>
        <p>
          Welcome to Peakers Hub Customer Service. We’re here to help you with
          your shopping experience in Kenya.
        </p>
      </div>

      {/* Service Categories */}
      <div className="cs-grid">
        {services.map((service, index) => (
          <div key={index} className="cs-card">
            <h2>{service.title}</h2>
            <p>{service.description}</p>
            <button className="cs-btn">Learn More</button>
          </div>
        ))}
      </div>

      {/* Contact Help Section */}
      <div className="cs-contact">
        <h2>Need More Help?</h2>
        <p>Our customer service team is available 24/7.</p>
        <ul>
          <li>Email: support@peakershub.co.ke</li>
          <li>Phone: +254 700 123 456</li>
          <li>Live Chat: Available on your account dashboard</li>
        </ul>
      </div>
    </div>
  );
};

export default CustomerService;
