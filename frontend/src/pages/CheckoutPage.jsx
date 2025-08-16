import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import "./css/CheckoutPage.css";

const CheckoutPage = () => {
  const [cart, setCart] = useState([]);
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState("credit_card");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  // Mock addresses (replace with your API call)
  const addresses = [
    {
      id: 1,
      name: "Home",
      street: "123 Main St",
      city: "Nairobi",
      postalCode: "00100",
      country: "Kenya",
      isDefault: true,
    },
    {
      id: 2,
      name: "Work",
      street: "456 Business Ave",
      city: "Nairobi",
      postalCode: "00200",
      country: "Kenya",
      isDefault: false,
    },
  ];

  // Load cart data
  useEffect(() => {
    const storedCart = JSON.parse(localStorage.getItem("cart")) || [];
    setCart(storedCart);
    setSelectedAddress(addresses.find((addr) => addr.isDefault));
  }, []);

  // Calculate total price
  const subtotal = cart.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );
  const tax = subtotal * 0.16; // 16% VAT (adjust as needed)
  const total = subtotal + tax;

  // Handle place order
  const handlePlaceOrder = () => {
    if (!selectedAddress) {
      toast.error("Please select a delivery address");
      return;
    }

    setIsLoading(true);

    // Simulate API call (replace with actual checkout logic)
    setTimeout(() => {
      toast.success("Order placed successfully!");
      localStorage.removeItem("cart"); // Clear cart
      navigate("/order-confirmation"); // Redirect to confirmation page
      setIsLoading(false);
    }, 1500);
  };

  return (
    <div className="checkout-container">
      <div className="checkout-left">
        {/* Delivery Address Section */}
        <div className="checkout-section">
          <h2>1. Delivery Address</h2>
          <div className="address-list">
            {addresses.map((address) => (
              <div
                key={address.id}
                className={`address-card ${
                  selectedAddress?.id === address.id ? "selected" : ""
                }`}
                onClick={() => setSelectedAddress(address)}
              >
                <h3>
                  {address.name} {address.isDefault && "(Default)"}
                </h3>
                <p>{address.street}</p>
                <p>
                  {address.city}, {address.postalCode}
                </p>
                <p>{address.country}</p>
                {selectedAddress?.id === address.id && (
                  <div className="selected-tick">✓</div>
                )}
              </div>
            ))}
            <button className="add-address-btn">+ Add a new address</button>
          </div>
        </div>

        {/* Payment Method Section */}
        <div className="checkout-section">
          <h2>2. Payment Method</h2>
          <div className="payment-options">
            <label className="payment-method">
              <input
                type="radio"
                name="payment"
                checked={paymentMethod === "credit_card"}
                onChange={() => setPaymentMethod("credit_card")}
              />
              <span>Credit/Debit Card</span>
            </label>
            <label className="payment-method">
              <input
                type="radio"
                name="payment"
                checked={paymentMethod === "mpesa"}
                onChange={() => setPaymentMethod("mpesa")}
              />
              <span>M-Pesa</span>
            </label>
            <label className="payment-method">
              <input
                type="radio"
                name="payment"
                checked={paymentMethod === "cash_on_delivery"}
                onChange={() => setPaymentMethod("cash_on_delivery")}
              />
              <span>Cash on Delivery</span>
            </label>
          </div>
        </div>
      </div>

      {/* Order Summary */}
      <div className="checkout-right">
        <div className="order-summary">
          <h2>Order Summary</h2>
          <div className="summary-row">
            <span>Subtotal ({cart.length} items):</span>
            <span>KES {subtotal.toLocaleString()}</span>
          </div>
          <div className="summary-row">
            <span>Tax (16%):</span>
            <span>KES {tax.toLocaleString()}</span>
          </div>
          <div className="summary-row total">
            <span>Total:</span>
            <span>KES {total.toLocaleString()}</span>
          </div>
          <button
            className="place-order-btn"
            onClick={handlePlaceOrder}
            disabled={isLoading || !selectedAddress}
          >
            {isLoading ? "Processing..." : "Place Your Order"}
          </button>
          <div className="secure-checkout">
            <span className="lock-icon">🔒</span>
            <span>Secure Checkout</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;
