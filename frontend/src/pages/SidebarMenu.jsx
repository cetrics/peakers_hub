import React, { useState, useEffect } from "react";
import "./css/SidebarMenu.css";
import { useNavigate } from "react-router-dom";


const SidebarMenu = ({ isOpen, onClose }) => {
  const [categories, setCategories] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    fetch("/api/products")
      .then((res) => res.json())
      .then((data) => {
        const uniqueCategories = [
          ...new Set(
            data
              .map((p) => p.category_name)
              .filter((name) => name && name.toLowerCase() !== "top deals")
          ),
        ];
        setCategories(uniqueCategories);
      })
      .catch((err) => console.error("Failed to fetch categories:", err));
  }, []);

  const onCategoryClick = (category) => {
  onClose(); // close sidebar first

  // navigate to homepage and pass category via state
  navigate("/", { state: { scrollTo: category } });
};


  return (
    <div className={`sidebar-overlay ${isOpen ? "open" : ""}`}>
      <div className="sidebar">
        <div className="sidebar-header">
          <div className="sidebar-avatar">
            {/* Avatar icon */}
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="white"
              width="32"
              height="32"
            >
              <circle cx="12" cy="8" r="4" />
              <path d="M4 20c0-4 4-6 8-6s8 2 8 6v1H4v-1z" />
            </svg>
          </div>
          <h3>Hello, Cetric</h3>
        </div>

        <div className="sidebar-section">
          <h4>Make Money with Us</h4>
          <div className="sidebar-link">
            Sell products on Peakers Hub <span className="arrow">›</span>
          </div>
          <div className="sidebar-link">
            Sell on Peakers Hub Business<span className="arrow">›</span>
          </div>
          <div className="sidebar-link">
            Advertise Your Products <span className="arrow">›</span>
          </div>
        </div>

        <div className="sidebar-section">
          <h4>Shop by Category</h4>
          {categories.length === 0 ? (
            <p>Loading...</p>
          ) : (
            categories.map((cat, idx) => (
              <div
                className="sidebar-link"
                key={idx}
                onClick={() => onCategoryClick(cat)}
              >
                {cat} <span className="arrow">›</span>
              </div>
            ))
          )}
        </div>
      </div>

      <div className="close-btn" onClick={onClose}></div>
    </div>
  );
};

export default SidebarMenu;
