import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./css/AddAddressPage.css";

const AddAddressPage = () => {
  const [newAddress, setNewAddress] = useState({
    address_type: "Home",
    contact_name: "",
    contact_phone: "",
    address_line1: "",
    address_line2: "",
    town: "",
    county: "",
    postal_code: "",
    country: "",
    is_default: false,
  });

  const [successPopup, setSuccessPopup] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("adminToken"); // ✅ use adminToken
      console.log("Token:", token);

      const response = await axios.post("/api/addresses", newAddress, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      console.log("Request headers:", response.config.headers);

      setSuccessPopup(true);
    } catch (err) {
      console.error(err);
      alert("Failed to add address");
    }
  };

  return (
    <div className="add-address-container">
      <h2>Add New Address</h2>
      <form onSubmit={handleSubmit} className="address-form">
        {[
          { label: "Contact Name", key: "contact_name" },
          { label: "Phone", key: "contact_phone" },
          { label: "Address Line 1", key: "address_line1" },
          { label: "Address Line 2", key: "address_line2" },
          { label: "Town", key: "town" },
          { label: "County", key: "county" },
          { label: "Postal Code", key: "postal_code" },
          { label: "Country", key: "country" },
        ].map((field) => (
          <div className="form-group" key={field.key}>
            <label>{field.label}</label>
            <input
              type="text"
              value={newAddress[field.key]}
              onChange={(e) =>
                setNewAddress({ ...newAddress, [field.key]: e.target.value })
              }
              required={field.key !== "address_line2"}
            />
          </div>
        ))}

        <div className="form-group checkbox-group">
          <label>
            <input
              type="checkbox"
              checked={newAddress.is_default}
              onChange={(e) =>
                setNewAddress({ ...newAddress, is_default: e.target.checked })
              }
            />
            Set as default
          </label>
        </div>

        <button type="submit" className="save-btn">
          Save Address
        </button>
      </form>

      {successPopup && (
        <div className="popup-backdrop">
          <div className="popup-card">
            <h3>✅ Address added successfully!</h3>
            <button className="ok-btn" onClick={() => navigate("/checkout")}>
              OK
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AddAddressPage;
