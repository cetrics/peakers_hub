import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./css/AdminDashboard.css";

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    totalViews: "3.456K",
    totalProfit: "$45.2K",
    totalProducts: "2,450",
    totalUsers: "3,456",
  });

  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("adminToken");
    if (!token) {
      navigate("/login"); // redirect if no token
    }
  }, [navigate]);

  // You might want to fetch real stats in useEffect
  useEffect(() => {
    // Fetch dashboard stats here if needed
  }, []);

  return (
    <div className="dashboard">
      <h1>Dashboard Overview</h1>

      <section className="stats">
        <div className="card">
          <h3>{stats.totalViews}</h3>
          <p>Total views</p>
          <span className="trend up">0.43%</span>
        </div>
        <div className="card">
          <h3>{stats.totalProfit}</h3>
          <p>Total Profit</p>
          <span className="trend up">4.35%</span>
        </div>
        <div className="card">
          <h3>{stats.totalProducts}</h3>
          <p>Total Product</p>
          <span className="trend up">2.59%</span>
        </div>
        <div className="card">
          <h3>{stats.totalUsers}</h3>
          <p>Total Users</p>
          <span className="trend up">0.95%</span>
        </div>
      </section>

      <section className="charts">
        <div className="chart">
          <h4>Total Revenue</h4>
          <p>12.04.2022 - 12.05.2022</p>
          <div className="graph-placeholder">[Line Chart Placeholder]</div>
        </div>
        <div className="chart">
          <h4>Profit this week</h4>
          <p>This Week</p>
          <div className="graph-placeholder">[Bar Chart Placeholder]</div>
        </div>
      </section>
    </div>
  );
};

export default AdminDashboard;
