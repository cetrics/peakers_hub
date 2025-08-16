import React, { useState, useEffect } from "react";
import "./css/ProductPage.css";

const ProductModal = ({
  categories = [],
  allMaterials = [],
  allColors = [],
  allSizes = [],
  initialFormData,
  onSubmit,
  onClose,
  message,
}) => {
  const [localForm, setLocalForm] = useState(() => {
    const init = initialFormData || {};
    return {
      ...init,
      colors: (init.colors || []).map((c) =>
        typeof c === "object" ? String(c.color_id) : String(c)
      ),
      sizes: (init.sizes || []).map((s) =>
        typeof s === "object" ? String(s.size_id) : String(s)
      ),
      discount: init.discount || "",
    };
  });

  useEffect(() => {
    if (initialFormData) {
      const init = initialFormData;
      setLocalForm({
        ...init,
        colors: (init.colors || []).map((c) =>
          typeof c === "object"
            ? String(c.color_id || c.color?.id || c.id)
            : String(c)
        ),
        sizes: (init.sizes || []).map((s) =>
          typeof s === "object"
            ? String(s.size_id || s.size?.id || s.id)
            : String(s)
        ),
        discount: init.discount || "",
      });
    }
  }, [initialFormData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setLocalForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleMultiSelect = (e) => {
    const { name, options } = e.target;
    const selected = Array.from(options)
      .filter((opt) => opt.selected)
      .map((opt) => opt.value);
    setLocalForm((prev) => ({ ...prev, [name]: selected }));
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);

    setLocalForm((prev) => {
      const existing = prev.images.map((img) =>
        typeof img === "string" ? img : img.name
      );

      const newFiles = files.filter((file) => !existing.includes(file.name));

      return {
        ...prev,
        images: [...prev.images, ...newFiles],
      };
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(e, localForm);
  };
  const handleRemoveImage = (indexToRemove) => {
    setLocalForm((prev) => ({
      ...prev,
      images: prev.images.filter((_, index) => index !== indexToRemove),
    }));
  };

  return (
    <div className="modal">
      <div className="modal-content">
        <span className="close" onClick={onClose}>
          &times;
        </span>
        <h2>{initialFormData?.id ? "Edit Product" : "Add New Product"}</h2>

        {message && <div className="message">{message}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Product Name</label>
            <input
              name="name"
              value={localForm.name || ""}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label>Description</label>
            <textarea
              name="description"
              value={localForm.description || ""}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label>Price</label>
            <input
              type="number"
              name="price"
              value={localForm.price || ""}
              onChange={handleChange}
              required
            />
          </div>
          <div className="form-group">
            <label>Discount (%)</label>
            <input
              type="number"
              name="discount"
              value={localForm.discount || ""}
              onChange={handleChange}
              placeholder="Optional"
              min="0"
              step="0.01"
            />
          </div>

          <div className="form-group">
            <label>Brand</label>
            <input
              name="brand"
              value={localForm.brand || ""}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label>Stock Quantity</label>
            <input
              type="number"
              name="stock_quantity"
              value={localForm.stock_quantity || 0}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label>Category</label>
            <select
              name="category_id"
              value={localForm.category_id || ""}
              onChange={handleChange}
              required
            >
              <option value="">Select Category</option>
              {Array.isArray(categories) &&
                categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
            </select>
          </div>

          <div className="form-group">
            <label>Material</label>
            <select
              name="material"
              value={localForm.material || ""}
              onChange={handleChange}
              required
            >
              <option value="">Select Material</option>
              {Array.isArray(allMaterials) &&
                allMaterials.map((mat) => (
                  <option key={mat} value={mat}>
                    {mat}
                  </option>
                ))}
            </select>
          </div>

          <div className="form-group">
            <label>Colors</label>
            <div className="checkboxes">
              {Array.isArray(allColors) &&
                allColors.map((color) => {
                  const isSelected = (localForm.colors || []).includes(
                    String(color.color_id)
                  );
                  return (
                    <label key={color.color_id} className="checkbox">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => {
                          const selected = localForm.colors || [];
                          const updatedColors = isSelected
                            ? selected.filter(
                                (id) => id !== String(color.color_id)
                              )
                            : [...selected, String(color.color_id)];
                          setLocalForm((prev) => ({
                            ...prev,
                            colors: updatedColors,
                          }));
                        }}
                      />
                      {color.name}
                    </label>
                  );
                })}
            </div>
            <small>
              Selected:{" "}
              {(localForm.colors || [])
                .map((id) => {
                  const match = allColors.find(
                    (c) => String(c.color_id) === id
                  );
                  return match ? match.name : id;
                })
                .join(", ")}
            </small>
          </div>

          <div className="form-group">
            <label>Sizes</label>
            <div className="checkboxes">
              {Array.isArray(allSizes) &&
                allSizes.map((size) => {
                  const isSelected = (localForm.sizes || []).includes(
                    String(size.size_id)
                  );
                  return (
                    <label key={size.size_id} className="checkbox">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => {
                          const selected = localForm.sizes || [];
                          const updatedSizes = isSelected
                            ? selected.filter(
                                (id) => id !== String(size.size_id)
                              )
                            : [...selected, String(size.size_id)];
                          setLocalForm((prev) => ({
                            ...prev,
                            sizes: updatedSizes,
                          }));
                        }}
                      />
                      {size.size_name}
                    </label>
                  );
                })}
            </div>
            <small>
              Selected:{" "}
              {(localForm.sizes || [])
                .map((id) => {
                  const match = allSizes.find((s) => String(s.size_id) === id);
                  return match ? match.size_name : id;
                })
                .join(", ")}
            </small>
          </div>

          <div className="form-group">
            <label>Product Image</label>
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={handleImageChange}
              required={!localForm.images || localForm.images.length === 0}
            />

            {Array.isArray(localForm.images) && localForm.images.length > 0 && (
              <div
                style={{
                  display: "flex",
                  gap: "10px",
                  marginTop: "10px",
                  flexWrap: "wrap",
                }}
              >
                {localForm.images.map((img, index) => {
                  const src =
                    typeof img === "object"
                      ? URL.createObjectURL(img)
                      : `/static/uploads/${img}`; // adjust path if needed

                  return (
                    <div key={index} style={{ position: "relative" }}>
                      <img
                        src={src}
                        alt={`Preview ${index + 1}`}
                        style={{
                          width: "120px",
                          borderRadius: "5px",
                          objectFit: "cover",
                        }}
                      />
                      <button
                        type="button"
                        onClick={() => handleRemoveImage(index)}
                        style={{
                          position: "absolute",
                          top: "-5px",
                          right: "-5px",
                          background: "red",
                          color: "white",
                          border: "none",
                          borderRadius: "50%",
                          width: "20px",
                          height: "20px",
                          cursor: "pointer",
                        }}
                        title="Remove image"
                      >
                        &times;
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
          <button type="submit" className="btn-primary">
            {initialFormData?.id ? "Update Product" : "Add Product"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ProductModal;
