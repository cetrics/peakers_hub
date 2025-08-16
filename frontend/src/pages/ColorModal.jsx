// ColorModal.jsx
import React, { useState } from "react";

const ColorModal = ({ setShowColorModal }) => {
  const [newColor, setNewColor] = useState("");
  const [message, setMessage] = useState("");

  const handleAddColor = async (e) => {
    e.preventDefault();
    if (!newColor.trim()) {
      setMessage("Color name is required.");
      return;
    }

    try {
      const res = await fetch("/api/colors", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ color: newColor }),
      });

      const result = await res.json();
      if (res.ok) {
        setMessage("✅ Color added successfully!");
        setNewColor("");
        setTimeout(() => {
          setShowColorModal(false);
        }, 1000);
      } else {
        setMessage(`❌ ${result.error || "Failed to add color."}`);
      }
    } catch (error) {
      console.error("Error:", error);
      setMessage("❌ Server error. Please try again.");
    }
  };

  return (
    <div className="modal">
      <div className="modal-content">
        <span className="close" onClick={() => setShowColorModal(false)}>
          &times;
        </span>
        <h2>Add New Color</h2>

        {message && <div className="message">{message}</div>}

        <form onSubmit={handleAddColor}>
          <div className="form-group">
            <label>Color Name</label>
            <input
              type="text"
              value={newColor}
              onChange={(e) => setNewColor(e.target.value)}
              required
            />
          </div>

          <button type="submit" className="btn-primary">
            Add Color
          </button>
        </form>
      </div>
    </div>
  );
};

export default ColorModal;
