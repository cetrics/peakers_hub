// Header.js
import React from "react";
import "./css/AdminHeader.css";
import { FaSearch } from "react-icons/fa";

const Header = ({ setActivePage, activePage }) => {
  const menuItems = [
    "Dashboard",
    "Orders",
    "Gift Cards",
    "Products",
    "Customers",
    "Customer Service",
    "Trusted Companies",
  ];

  return (
    <div className="orders-header">
      <div className="breadcrumb">
        <a href="#">Your Account</a> <span>›</span> <span>Cetric</span>
      </div>

      <div className="title-search-wrapper">
        <h1>Admin</h1>

        <div className="search-bar-wrapper">
          <div className="search-input-wrapper">
            <FaSearch className="search-icon" />
            <input type="text" placeholder="Search all orders" />
          </div>
          <button className="search-btn">Search Orders</button>
        </div>
      </div>

      <div className="orders-nav">
        {menuItems.map((item) => (
          <button
            key={item}
            onClick={() => setActivePage(item)}
            className={activePage === item ? "active" : ""}
          >
            {item}
          </button>
        ))}
      </div>
    </div>
  );
};

export default Header;
