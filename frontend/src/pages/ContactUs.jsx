// src/ContactUs.jsx
import React from "react";
import "./css/ContactUs.css";

const ContactUs = () => {
  return (
    <div className="contactus-container">
      {/* Header */}
      <div className="contactus-hero">
        <h1>Contact Us</h1>
        <p>We’d love to hear from you. Reach out anytime.</p>
      </div>

      {/* Contact Details & Form */}
      <div className="contactus-content">
        {/* Contact Info */}
        <div className="contactus-info">
          <h2>Get in Touch</h2>
          <p>
            <strong>Address:</strong> 123 Amazon Way, Seattle, WA
          </p>
          <p>
            <strong>Email:</strong> support@example.com
          </p>
          <p>
            <strong>Phone:</strong> +1 800 123 456
          </p>
        </div>

        {/* Contact Form */}
        <div className="contactus-form">
          <h2>Send Us a Message</h2>
          <form>
            <div className="form-group">
              <label>Name</label>
              <input type="text" placeholder="Enter your name" required />
            </div>
            <div className="form-group">
              <label>Email</label>
              <input type="email" placeholder="Enter your email" required />
            </div>
            <div className="form-group">
              <label>Message</label>
              <textarea rows="5" placeholder="Write your message..." required />
            </div>
            <button type="submit" className="contactus-btn">
              Send Message
            </button>
          </form>
        </div>
      </div>

      {/* Google Map */}
      <div className="contactus-map">
        <iframe
          title="Google Map"
          src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2689.512445504506!2d-122.3372943843694!3d47.62256777918533!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x54901545e5f8f9cf%3A0xdaa1b8f4d69db2a2!2sAmazon%20Spheres!5e0!3m2!1sen!2sus!4v1691189022250!5m2!1sen!2sus"
          width="100%"
          height="350"
          allowFullScreen=""
          loading="lazy"
        ></iframe>
      </div>
    </div>
  );
};

export default ContactUs;
