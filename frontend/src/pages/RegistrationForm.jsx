import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "./css/RegistrationForm.css";

function RegistrationForm() {
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
    first_name: "",
    last_name: "",
    phone: "",
    id_number: "",
    date_of_birth: "",
    gender: "",
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const validate = () => {
    const newErrors = {};

    if (!formData.username) newErrors.username = "Enter your username";
    if (!formData.email) newErrors.email = "Enter your email";
    if (!formData.password) newErrors.password = "Enter your password";
    if (formData.password.length < 6)
      newErrors.password = "Password must be at least 6 characters";
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords must match";
    }
    if (!formData.phone) newErrors.phone = "Enter your phone number";
    if (!formData.id_number) newErrors.id_number = "Enter your ID number";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    try {
      const response = await axios.post("/api/auth/register", {
        username: formData.username,
        email: formData.email,
        password: formData.password,
        first_name: formData.first_name || null,
        last_name: formData.last_name || null,
        phone: formData.phone,
        id_number: formData.id_number,
        date_of_birth: formData.date_of_birth || null,
        gender: formData.gender || null,
      });

      if (response.status === 201) {
        setShowSuccessModal(true);
      } else {
        setErrors({ submit: response.data.error || "Registration failed" });
      }
    } catch (err) {
      setErrors({
        submit:
          err.response?.data?.error || "Registration failed. Please try again.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  const handleContinueToLogin = () => {
    setShowSuccessModal(false);
    navigate("/login");
  };
  return (
    <div className="registration-container">
      {showSuccessModal && (
        <div className="success-modal-overlay">
          <div className="success-modal">
            <div className="success-modal-header">
              <h2>Account Created Successfully</h2>
            </div>
            <div className="success-modal-body">
              <div className="success-icon">
                <svg viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10 10-4.5 10-10S17.5 2 12 2zm-2 15l-5-5 1.4-1.4 3.6 3.6 7.6-7.6L19 8l-9 9z"></path>
                </svg>
              </div>
              <p>Your account has been successfully created.</p>
              <p>You can now sign in with your email and password.</p>
            </div>
            <div className="success-modal-footer">
              <button
                className="continue-button"
                onClick={handleContinueToLogin}
              >
                Continue to Sign In
              </button>
            </div>
          </div>
        </div>
      )}
      <div className="registration-logo">
        <h1>YourStore</h1>
      </div>

      <div className="registration-box">
        <h2>Create Account</h2>

        {errors.submit && (
          <div className="error-message">
            <i className="error-icon">!</i>
            <span>{errors.submit}</span>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="username">Username</label>
            <input
              type="text"
              id="username"
              name="username"
              value={formData.username}
              onChange={handleChange}
              className={errors.username ? "input-error" : ""}
            />
            {errors.username && (
              <div className="field-error">
                <span className="error-icon">!</span>
                <span>{errors.username}</span>
              </div>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className={errors.email ? "input-error" : ""}
            />
            {errors.email && (
              <div className="field-error">
                <span className="error-icon">!</span>
                <span>{errors.email}</span>
              </div>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              className={errors.password ? "input-error" : ""}
              placeholder="At least 6 characters"
            />
            {errors.password && (
              <div className="field-error">
                <span className="error-icon">!</span>
                <span>{errors.password}</span>
              </div>
            )}
            <div className="password-requirements">
              <i className="info-icon">i</i>
              <span>Passwords must be at least 6 characters.</span>
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="confirmPassword">Re-enter password</label>
            <input
              type="password"
              id="confirmPassword"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              className={errors.confirmPassword ? "input-error" : ""}
            />
            {errors.confirmPassword && (
              <div className="field-error">
                <span className="error-icon">!</span>
                <span>{errors.confirmPassword}</span>
              </div>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="first_name">First name (optional)</label>
            <input
              type="text"
              id="first_name"
              name="first_name"
              value={formData.first_name}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label htmlFor="last_name">Last name (optional)</label>
            <input
              type="text"
              id="last_name"
              name="last_name"
              value={formData.last_name}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label htmlFor="phone">Mobile number</label>
            <div className="phone-input-group">
              <select className="phone-prefix">
                <option>KE +254</option>
              </select>
              <input
                type="tel"
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                className={errors.phone ? "input-error" : ""}
              />
            </div>
            {errors.phone && (
              <div className="field-error">
                <span className="error-icon">!</span>
                <span>{errors.phone}</span>
              </div>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="id_number">National ID/Passport</label>
            <input
              type="text"
              id="id_number"
              name="id_number"
              value={formData.id_number}
              onChange={handleChange}
              className={errors.id_number ? "input-error" : ""}
            />
            {errors.id_number && (
              <div className="field-error">
                <span className="error-icon">!</span>
                <span>{errors.id_number}</span>
              </div>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="date_of_birth">Date of birth (optional)</label>
            <input
              type="date"
              id="date_of_birth"
              name="date_of_birth"
              value={formData.date_of_birth}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label htmlFor="gender">Gender (optional)</label>
            <select
              id="gender"
              name="gender"
              value={formData.gender}
              onChange={handleChange}
            >
              <option value="">-- Select --</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
            </select>
          </div>

          <button
            type="submit"
            className="register-button"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Creating your account..." : "Create your account"}
          </button>
        </form>

        <div className="terms">
          By creating an account, you agree to YourStore's
          <a href="/conditions"> Conditions of Use </a>
          and <a href="/privacy"> Privacy Notice</a>.
        </div>

        <div className="divider">
          <span>Already have an account?</span>
        </div>

        <button className="login-button" onClick={() => navigate("/login")}>
          Sign in
        </button>
      </div>
    </div>
  );
}

export default RegistrationForm;
