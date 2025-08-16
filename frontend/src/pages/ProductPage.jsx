// ProductPage.jsx
import React, { useEffect, useState } from "react";
import axios from "axios";
import "./css/ProductPage.css";
import { useNavigate } from "react-router-dom";
import ProductModal from "./ProductModal";
import ColorModal from "./ColorModal";
import SizeModal from "./SizeModal";
import CategoryModal from "./CategoryModal"; // make sure path is correct
import "react-responsive-carousel/lib/styles/carousel.min.css"; // must import the styles
import { Carousel } from "react-responsive-carousel";

//import CategoryModal from "./modals/CategoryModal";

const ProductPage = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [allColors, setAllColors] = useState([]);
  const [allSizes, setAllSizes] = useState([]);
  const [editProductData, setEditProductData] = useState(null); // New state
  const [allMaterials] = useState([
    "Cotton",
    "Polyester",
    "Leather",
    "Silk",
    "Wool",
    "Denim",
  ]);

  const [showProductModal, setShowProductModal] = useState(false);
  const [showColorModal, setShowColorModal] = useState(false);
  const [showSizeModal, setShowSizeModal] = useState(false);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [selectedProductId, setSelectedProductId] = useState("");

  const [productForm, setProductForm] = useState({
    name: "",
    description: "",
    price: "",
    category_id: "",
    brand: "",
    material: "",
    stock_quantity: 0,
    colors: [],
    sizes: [],
    images: [], // 🆕 updated from image: null
  });

  const [newColor, setNewColor] = useState("");
  const [newSize, setNewSize] = useState("");
  const [newCategory, setNewCategory] = useState("");
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("adminToken");
    if (!token) {
      navigate("/login"); // redirect if no token
    }
  }, [navigate]);

  useEffect(() => {
    fetchInitialData();
    fetchProducts();
  }, []);

  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => {
        setMessage("");
      }, 3000); // 3 seconds

      return () => clearTimeout(timer); // Cleanup on unmount or message change
    }
  }, [message]);

  const fetchInitialData = async () => {
    try {
      const [catRes, colorRes, sizeRes] = await Promise.all([
        axios.get("/api/categories"),
        axios.get("/api/colors"),
        axios.get("/api/sizes"),
      ]);
      setCategories(catRes.data);
      setAllColors(colorRes.data);
      setAllSizes(sizeRes.data); // ✅ keep full size object: { size_id, size_name }
    } catch (error) {
      console.error("Error fetching data", error);
    }
  };

  const fetchProducts = async () => {
    try {
      const res = await axios.get("/api/products");
      setProducts(res.data);
    } catch (error) {
      console.error("Error fetching products", error);
    }
  };

  const handleAddProduct = async (e, formDataOverride = null) => {
    e.preventDefault();
    const formData = formDataOverride || productForm;

    if ((!formData.images || formData.images.length === 0) && !formData.id) {
      return setMessage("Image is required");
    }

    const data = new FormData();
    Object.entries(formData).forEach(([key, val]) => {
      if (Array.isArray(val)) {
        if (key === "images") {
          // ✅ Upload all images individually
          val.forEach((file) => data.append("images", file));
        } else {
          val.forEach((v) => data.append(key, v));
        }
      } else if (val !== null) {
        data.append(key, val);
      }
    });

    try {
      if (formData.id) {
        await axios.put(`/api/products/${formData.id}`, data);
        setMessage("✅ Product updated successfully!");
      } else {
        await axios.post("/api/products", data);
        setMessage("✅ Product added successfully!");
      }

      fetchProducts();
      setProductForm({
        name: "",
        description: "",
        price: "",
        category_id: "",
        brand: "",
        material: "",
        stock_quantity: 0,
        colors: [],
        sizes: [],
        images: [], // reset
      });
      setShowProductModal(false);
      setEditProductData(null);
    } catch (error) {
      console.error(error);
      setMessage("❌ Failed to save product");
    }
  };

  const handleAddColor = async (e, data) => {
    e.preventDefault();
    try {
      await axios.post("/api/colors", data);
      setMessage("✅ Color added successfully!");
      fetchInitialData(); // to refresh color list if needed
      setShowColorModal(false);
    } catch (error) {
      console.error(error);
      setMessage("❌ Failed to add color");
    }
  };

  const handleAddSize = async (e) => {
    e.preventDefault();
    try {
      await axios.post("/api/sizes", { size: newSize });
      setMessage("✅ Size added successfully!");
      setNewSize("");
      fetchInitialData();
      setShowSizeModal(false);
    } catch (error) {
      console.error(error);
      setMessage("❌ Failed to add size");
    }
  };

  const handleAddCategory = async (e) => {
    e.preventDefault();
    try {
      await axios.post("/api/categories", { name: newCategory });
      setMessage("✅ Category added successfully!");
      setNewCategory("");
      fetchInitialData();
      setShowCategoryModal(false);
    } catch (error) {
      console.error(error);
      setMessage("❌ Failed to add category");
    }
  };
  useEffect(() => {
    let startY = 0;
    let currentY = 0;
    let isScrolling = false;

    const handleTouchStart = (e) => {
      startY = e.touches[0].clientY;
    };

    const handleTouchMove = (e) => {
      currentY = e.touches[0].clientY;
      const deltaY = currentY - startY;

      // If vertical swipe is more than 10px, treat it as scroll
      if (Math.abs(deltaY) > 10) {
        isScrolling = true;
        window.scrollBy(0, -deltaY); // Scroll page vertically
        startY = currentY; // Update startY to avoid multiplying scroll
      }
    };

    const carousels = document.querySelectorAll(".product-carousel");

    carousels.forEach((carousel) => {
      carousel.addEventListener("touchstart", handleTouchStart, {
        passive: false,
      });
      carousel.addEventListener("touchmove", handleTouchMove, {
        passive: false,
      });
    });

    return () => {
      carousels.forEach((carousel) => {
        carousel.removeEventListener("touchstart", handleTouchStart);
        carousel.removeEventListener("touchmove", handleTouchMove);
      });
    };
  }, [products]);

  return (
    <div className="product-management">
      <h1>Product Management</h1>
      {message && <div className="message-bar">{message}</div>}
      <div className="action-buttons">
        <button
          className="btn-primary"
          onClick={() => setShowProductModal(true)}
        >
          Add Product
        </button>
        <button
          className="btn-secondary"
          onClick={() => setShowColorModal(true)}
        >
          Add Color
        </button>
        <button
          className="btn-secondary"
          onClick={() => setShowSizeModal(true)}
        >
          Add Size
        </button>
        <button
          className="btn-secondary"
          onClick={() => setShowCategoryModal(true)}
        >
          Add Category
        </button>
      </div>

      <div className="products-grid">
        {products.map((product) => (
          <div
            className="product-card"
            key={product.id}
            onClick={() => {
              const formattedProduct = {
                ...product,
                colors:
                  product.colors?.map((c) =>
                    typeof c === "object" ? String(c.color_id) : String(c)
                  ) || [],
                sizes:
                  product.sizes?.map((s) =>
                    typeof s === "object" ? String(s.size_id) : String(s)
                  ) || [],
                images:
                  product.images && product.images.length > 0
                    ? product.images
                    : product.image_url
                    ? [product.image_url]
                    : [],
              };

              setEditProductData(formattedProduct);
              setShowProductModal(true);
            }}
          >
            <div className="product-image-container">
              {product.images && product.images.length > 0 && (
                <div className="carousel-scroll-wrapper">
                  <Carousel
                    showThumbs={false}
                    showStatus={false}
                    infiniteLoop
                    autoPlay={window.innerWidth > 768}
                    interval={3000}
                    transitionTime={600}
                    stopOnHover
                    dynamicHeight={false}
                    emulateTouch
                    swipeable
                    className="product-carousel"
                  >
                    {product.images.map((filename, index) => (
                      <div key={index}>
                        <img
                          src={`/static/uploads/${filename}`}
                          alt={`${product.name} ${index + 1}`}
                          className="carousel-image"
                        />
                      </div>
                    ))}
                  </Carousel>
                </div>
              )}
            </div>

            <div className="product-info">
              <div className="product-title">{product.name}</div>
              <div className="product-price">
                {product.discount && product.discount > 0 ? (
                  <>
                    <span className="original-price">
                      Ksh.{parseFloat(product.price).toFixed(2)}
                    </span>
                    <span className="discounted-price">
                      Ksh.
                      {(product.price * (1 - product.discount / 100)).toFixed(
                        2
                      )}
                    </span>
                  </>
                ) : (
                  <span className="discounted-price">
                    Ksh.{parseFloat(product.price).toFixed(2)}
                  </span>
                )}
              </div>

              <div className="product-meta">
                <div>Brand: {product.brand || "N/A"}</div>
                <div>Material: {product.material || "N/A"}</div>
                <div>
                  Category:{" "}
                  {categories.find((c) => c.id === product.category_id)?.name ||
                    "N/A"}
                </div>
              </div>
              <div className="product-stock">
                {product.stock_quantity > 0
                  ? `In Stock (${product.stock_quantity})`
                  : "Out of Stock"}
              </div>
              {(product.colors?.length > 0 || product.sizes?.length > 0) && (
                <div className="product-attributes">
                  {product.colors?.map((color) => (
                    <span
                      key={typeof color === "object" ? color.color_id : color}
                    >
                      {typeof color === "object" ? color.name : color}
                    </span>
                  ))}
                  {product.sizes?.map((size) => (
                    <span key={typeof size === "object" ? size.size_id : size}>
                      {typeof size === "object" ? size.size_name : size}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {showProductModal && (
        <ProductModal
          initialFormData={editProductData || productForm}
          onSubmit={(e, updatedForm) => handleAddProduct(e, updatedForm)}
          categories={categories}
          allMaterials={allMaterials}
          allColors={allColors}
          allSizes={allSizes}
          onClose={() => {
            setShowProductModal(false);
            setEditProductData(null);
          }}
          message={message}
          isEdit={!!editProductData}
        />
      )}

      {showColorModal && <ColorModal setShowColorModal={setShowColorModal} />}
      {showSizeModal && (
        <SizeModal
          newSize={newSize}
          setNewSize={setNewSize}
          handleAddSize={handleAddSize}
          setShowSizeModal={setShowSizeModal}
        />
      )}
      {showCategoryModal && (
        <CategoryModal
          setShowCategoryModal={setShowCategoryModal}
          onCategoryAdded={fetchInitialData}
        />
      )}
    </div>
  );
};

export default ProductPage;
