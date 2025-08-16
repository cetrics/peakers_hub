import React, { useState } from "react";

const CategoryModal = ({ setShowCategoryModal, onCategoryAdded }) => {
  const [newCategory, setNewCategory] = useState("");
  const [message, setMessage] = useState("");

  const handleAddCategory = async (e) => {
    e.preventDefault();

    if (!newCategory.trim()) {
      setMessage("Category name is required.");
      return;
    }

    try {
      const res = await fetch("/api/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newCategory }),
      });

      const result = await res.json();
      if (res.ok) {
        setMessage("✅ Category added successfully!");
        setNewCategory("");
        if (onCategoryAdded) onCategoryAdded(); // ✅ trigger category refresh
        setTimeout(() => {
          setShowCategoryModal(false);
        }, 1000);
      } else {
        setMessage(`❌ ${result.error || "Failed to add category."}`);
      }
    } catch (error) {
      console.error("Error:", error);
      setMessage("❌ Server error. Please try again.");
    }
  };

  return (
    <div className="modal">
      <div className="modal-content">
        <span className="close" onClick={() => setShowCategoryModal(false)}>
          &times;
        </span>
        <h2>Add New Category</h2>

        {message && <div className="message">{message}</div>}

        <form onSubmit={handleAddCategory}>
          <div className="form-group">
            <label>Category Name</label>
            <input
              type="text"
              value={newCategory}
              onChange={(e) => setNewCategory(e.target.value)}
              required
            />
          </div>

          <button type="submit" className="btn-primary">
            Add Category
          </button>
        </form>
      </div>
    </div>
  );
};

export default CategoryModal;
