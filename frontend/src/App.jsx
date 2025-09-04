import React, { useState, useEffect } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  useLocation,
} from "react-router-dom";
import HomePage from "./pages/Home.jsx";
import AdminContainer from "./pages/AdminContainer.jsx"; // ✅ New import
import CartPage from "./pages/CartPage.jsx";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import CheckoutPage from "./pages/CheckoutPage.jsx";
import RegistrationForm from "./pages/RegistrationForm.jsx";
import AdminLogin from "./pages/AdminLogin.jsx";
import { useNavigate } from "react-router-dom";
import AddAddressPage from "./pages/AddAddressPage.jsx";
import TrackingPage from "./pages/TrackingPage";
import OrdersPage from "./pages/OrdersPage.jsx";
import "./pages/css/MainAdmin.css";
import OrderDetailsPage from "./pages/OrderDetailsPage";
import SidebarMenu from "./pages/SidebarMenu.jsx";
import SearchPage from "./pages/SearchPage";
import ContactUs from "./pages/ContactUs.jsx";
import Policy from "./pages/Policy.jsx";
import TrustedCompanies from "./pages/TrustedCompanies.jsx";
import CustomerService from "./pages/CustomerService.jsx";

const AppRoutes = () => {
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  useEffect(() => {
    const authLink = document.getElementById("auth-link");
    const authText = document.getElementById("auth-text");

    if (!authLink || !authText) return;

    const token = localStorage.getItem("adminToken");
    if (token) {
      authText.textContent = "Sign out";
      authLink.href = "#";
      authLink.onclick = (e) => {
        e.preventDefault();
        localStorage.removeItem("adminToken");
        navigate("/");
        window.location.reload();
      };
    } else {
      authText.textContent = "Sign in";
      authLink.href = "/login";
      authLink.onclick = null; // default link behavior
    }
  }, [navigate]);

  useEffect(() => {
    const btn = document.getElementById("all-menu-btn");
    if (!btn) return;

    const openSidebar = () => setIsSidebarOpen(true);
    btn.addEventListener("click", openSidebar);

    return () => btn.removeEventListener("click", openSidebar);
  }, []);
  return (
    <>
      {/* ✅ Mount SearchPage globally so search works everywhere */}
      <SearchPage />
      {/* Sidebar should live here, outside of Routes */}
      <SidebarMenu
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/cart" element={<CartPage />} />
        <Route path="/checkout" element={<CheckoutPage />} />
        <Route path="/register" element={<RegistrationForm />} />
        <Route path="/login" element={<AdminLogin />} />
        <Route path="/contact-us" element={<ContactUs />} />
        <Route path="/policy" element={<Policy />} />
        <Route path="/trusted-companies" element={<TrustedCompanies />} />
        <Route path="/customer-service" element={<CustomerService />} />
        <Route path="/order-confirmation" element={<OrdersPage />} />
        <Route path="/search" element={<SearchPage />} />
        <Route
          path="/order-confirmation/:orderNumber"
          element={<OrderDetailsPage />}
        />
        <Route
          path="/order-confirmation/:orderNumber/track"
          element={<TrackingPage />}
        />
        <Route path="/add-address" element={<AddAddressPage />} />
        <Route path="/dashboard" element={<AdminContainer />} />{" "}
        {/* ✅ Changed here */}
      </Routes>
    </>
  );
};

const App = () => (
  <Router>
    <AppRoutes />
    <ToastContainer
      position="top-right"
      autoClose={4000}
      hideProgressBar
      closeOnClick
      pauseOnHover
      draggable
      newestOnTop
      icon={false} // disable default icons so we can style our own
      toastClassName="amazon-toast"
      bodyClassName="amazon-toast-body"
    />
  </Router>
);

export default App;
