import React from "react";
import "./css/Policy.css";

const Policy = () => {
  return (
    <div className="policy-container">
      {/* Hero Section */}
      <div className="policy-hero">
        <h1>Our Policy</h1>
        <p>
          Welcome to Peakers Hub. We value your trust and strive to provide
          transparent and fair policies that protect you while shopping with us.
        </p>
      </div>

      {/* Policy Content */}
      <div className="policy-content">
        {/* Privacy Policy */}
        <section className="policy-section">
          <h2>Privacy Policy</h2>
          <p>
            At Peakers Hub, your privacy is important to us. We collect only the
            information necessary to process your orders and improve your
            shopping experience. We do not share your personal data with
            third-party companies without your consent.
          </p>
        </section>

        {/* Returns Policy */}
        <section className="policy-section">
          <h2>Returns & Refunds</h2>
          <p>
            If you are not satisfied with your purchase, you may return most
            items within <strong>7 days</strong> of delivery for a full refund
            or exchange. Items must be unused and in their original packaging.
            Some exclusions may apply.
          </p>
        </section>

        {/* Shipping Policy */}
        <section className="policy-section">
          <h2>Shipping Policy</h2>
          <p>
            We deliver across Kenya with fast and reliable shipping partners.
            Orders are usually processed within 24 hours, and delivery time
            depends on your location. Standard shipping within Nairobi takes{" "}
            <strong>1–2 business days</strong>, while other regions may take up
            to <strong>5 business days</strong>.
          </p>
        </section>

        {/* Terms of Service */}
        <section className="policy-section">
          <h2>Terms of Service</h2>
          <p>
            By using Peakers Hub, you agree to comply with our policies and
            applicable laws. Misuse of our platform, fraudulent activities, or
            abuse of offers will lead to suspension of your account.
          </p>
        </section>

        {/* Contact */}
        <section className="policy-section">
          <h2>Contact Us</h2>
          <p>
            For questions or concerns regarding our policies, please reach out
            to our support team:
          </p>
          <ul>
            <li>Email: support@peakershub.co.ke</li>
            <li>Phone: +254 700 123 456</li>
            <li>Address: Nairobi, Kenya</li>
          </ul>
        </section>
      </div>
    </div>
  );
};

export default Policy;
