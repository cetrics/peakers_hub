import React, { useState } from "react";
import Header from "./Header";
import AdminDashboard from "./AdminDashboard";
import ProductPage from "./ProductPage";

const AdminContainer = () => {
  const [activePage, setActivePage] = useState("Dashboard");

  return (
    <div className="admin-container">
      <Header setActivePage={setActivePage} activePage={activePage} />
      <div className="content-area">
        {activePage === "Dashboard" && <AdminDashboard />}
        {activePage === "Products" && <ProductPage />}
        {activePage !== "Dashboard" && activePage !== "Products" && (
          <div className="main-content">
            <h2>{activePage}</h2>
            <p>This page is under construction.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminContainer;
