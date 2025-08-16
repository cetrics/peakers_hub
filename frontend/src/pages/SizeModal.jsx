import React from "react";
import "./css/ProductPage.css"; // or adjust the path if different

const SizeModal = ({
  newSize,
  setNewSize,
  handleAddSize,
  setShowSizeModal,
}) => {
  return (
    <div className="modal">
      <div className="modal-content">
        <span className="close" onClick={() => setShowSizeModal(false)}>
          &times;
        </span>
        <h2>Add New Size</h2>
        <form onSubmit={handleAddSize}>
          <div className="form-group">
            <label>Size Name</label>
            <input
              type="text"
              value={newSize}
              onChange={(e) => setNewSize(e.target.value)}
              required
              placeholder="e.g., S, M, L, XL"
            />
          </div>
          <button type="submit" className="btn-primary">
            Add Size
          </button>
        </form>
      </div>
    </div>
  );
};

export default SizeModal;
