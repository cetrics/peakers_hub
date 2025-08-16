import React, { useEffect } from "react";
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

const AppRoutes = () => {
  const navigate = useNavigate();
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
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/cart" element={<CartPage />} />
      <Route path="/checkout" element={<CheckoutPage />} />
      <Route path="/register" element={<RegistrationForm />} />
      <Route path="/login" element={<AdminLogin />} />
      <Route path="/dashboard" element={<AdminContainer />} />{" "}
      {/* ✅ Changed here */}
    </Routes>
  );
};

const App = () => (
  <Router>
    <AppRoutes />
    <ToastContainer
      position="top-right"
      autoClose={2500}
      hideProgressBar={false}
      newestOnTop={false}
      closeOnClick
      pauseOnFocusLoss
      draggable
      pauseOnHover
      theme="colored"
    />
  </Router>
);

export default App;
