import React, { useState, useEffect } from "react";
import "./css/HomePage.css";
import { Carousel } from "react-responsive-carousel";
import "react-responsive-carousel/lib/styles/carousel.min.css";
import { toast } from "react-toastify";
import SidebarMenu from "./SidebarMenu";
import { useLocation } from "react-router-dom";
import SearchPage from "./SearchPage";

function useQuery() {
  return new URLSearchParams(useLocation().search);
}

const slides = [
  {
    title: "Watches",
    image: "../static/images/watch.JPG",
    description: "Premium timepieces for every occasion",
  },
  {
    title: "Baby Toys",
    image: "../static/images/toys.jpg",
    description: "Safe and educational toys for your little ones",
  },
  {
    title: "Gaming",
    image: "../static/images/games.jpg",
    description: "Cutting-edge gaming gear for enthusiasts",
  },
];

// CategorySection component
const CategorySection = ({ category, products, renderProductCard }) => {
  const [showAll, setShowAll] = useState(false);

  return (
    <section id={`category-${category}`} className="product-section">
      <h2>{category}</h2>
      <div className="product-grid">
        {(showAll ? products : products.slice(0, 4)).map(renderProductCard)}
      </div>
      {products.length > 4 && (
        <div style={{ textAlign: "center", marginTop: "10px" }}>
          <button
            onClick={() => setShowAll((prev) => !prev)}
            className="add-to-cart-btn"
            style={{ width: "auto", padding: "6px 20px" }}
          >
            {showAll ? "See Less" : "See More"}
          </button>
        </div>
      )}
    </section>
  );
};

const HomePage = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);

  const [topDeals, setTopDeals] = useState([]);
  const [otherProducts, setOtherProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const location = useLocation();
  const query = useQuery();

  useEffect(() => {
    const categoryToScroll = query.get("scrollTo") || location.state?.scrollTo;
    if (categoryToScroll) {
      setTimeout(() => {
        const el = document.getElementById(`category-${categoryToScroll}`);
        if (el) {
          el.scrollIntoView({ behavior: "smooth", block: "start" });
        }
      }, 100);
    }
  }, [location.search, location.state]);

  useEffect(() => {
    fetch("/api/products")
      .then((res) => res.json())
      .then((data) => {
        const top = data.filter(
          (product) =>
            product.category_name &&
            product.category_name.toLowerCase() === "top deals"
        );
        const rest = data.filter(
          (product) =>
            !product.category_name ||
            product.category_name.toLowerCase() !== "top deals"
        );
        setTopDeals(top);
        setOtherProducts(rest);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Failed to fetch products:", err);
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    let startY = 0;
    let currentY = 0;

    const handleTouchStart = (e) => {
      startY = e.touches[0].clientY;
    };

    const handleTouchMove = (e) => {
      currentY = e.touches[0].clientY;
      const deltaY = currentY - startY;

      if (Math.abs(deltaY) > 10) {
        window.scrollBy(0, -deltaY);
        startY = currentY;
      }
    };

    let carousels = [];

    const setupListeners = () => {
      // Detach previous
      carousels.forEach((carousel) => {
        carousel.removeEventListener("touchstart", handleTouchStart);
        carousel.removeEventListener("touchmove", handleTouchMove);
      });

      // Select all carousels including Top Deals
      carousels = Array.from(document.querySelectorAll(".product-carousel"));

      carousels.forEach((carousel) => {
        carousel.addEventListener("touchstart", handleTouchStart, {
          passive: false,
        });
        carousel.addEventListener("touchmove", handleTouchMove, {
          passive: false,
        });
      });
    };

    const timer = setTimeout(setupListeners, 100);

    return () => {
      clearTimeout(timer);
      carousels.forEach((carousel) => {
        carousel.removeEventListener("touchstart", handleTouchStart);
        carousel.removeEventListener("touchmove", handleTouchMove);
      });
    };
  });

  const nextSlide = () => {
    if (isTransitioning) return;
    setIsTransitioning(true);
    setImageLoaded(false);
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  };

  const prevSlide = () => {
    if (isTransitioning) return;
    setIsTransitioning(true);
    setImageLoaded(false);
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  };

  useEffect(() => {
    const timer = setInterval(() => {
      nextSlide();
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (isTransitioning) {
      const timer = setTimeout(() => {
        setIsTransitioning(false);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [isTransitioning]);

  useEffect(() => {
    const cart = JSON.parse(localStorage.getItem("cart")) || [];
    const cartCountEl = document.querySelector(".cart-count");
    if (cartCountEl) {
      const totalItems = cart.reduce(
        (sum, item) => sum + (item.quantity || 1),
        0
      );
      cartCountEl.textContent = totalItems;
    }
  }, []);

  const renderProductCard = (product, index) => {
    const images =
      product.images && product.images.length > 0
        ? product.images
        : product.image_url
        ? [product.image_url]
        : [];

    const colors = product.colors || [];
    const discount = product.discount || 0;
    const originalPrice = product.price || 0;
    const discountedPrice = originalPrice - (originalPrice * discount) / 100;
    const stock = product.stock_quantity ?? 0;

    return (
      <div className="product-card" key={product.id || index}>
        <div className="product-image-container">
          {discount > 0 && (
            <div className="discount-badge">{discount}% off</div>
          )}

          {images.length > 0 && (
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
                {images.map((filename, i) => (
                  <div key={i}>
                    <img
                      src={`../static/uploads/${filename}`}
                      alt={`${product.name || "Product"} ${i + 1}`}
                      className="carousel-image"
                      onError={(e) => {
                        e.target.src = "/static/images/fallback.jpg";
                      }}
                    />
                  </div>
                ))}
              </Carousel>
            </div>
          )}
        </div>

        <h3>
          {product.name && product.name.length > 55
            ? product.name.substring(0, 55) + "..."
            : product.name || `Product ${index + 1}`}
        </h3>

        <p className="product-meta">
          {colors.length} Color{colors.length !== 1 ? "s" : ""} | {stock} in
          stock
        </p>

        <p className="price-line">
          {discount > 0 ? (
            <>
              <span className="original-price">
                KES {originalPrice.toLocaleString()}
              </span>
              <span className="discounted-price">
                KES {discountedPrice.toLocaleString()}
              </span>
            </>
          ) : (
            <span className="discounted-price">
              KES {originalPrice.toLocaleString()}
            </span>
          )}
        </p>
        {stock > 0 && (
          <div className="stock-bar-container">
            <div className="stock-bar-label">{stock} items remaining</div>
            <div className="stock-bar-track">
              <div
                className="stock-bar-fill"
                style={{ width: `${(stock / 100) * 100}%` }}
              ></div>
            </div>
          </div>
        )}

        <button
          className="add-to-cart-btn"
          onClick={() => {
            const cart = JSON.parse(localStorage.getItem("cart")) || [];
            const existing = cart.find((item) => item.id === product.id);

            if (existing) {
              existing.quantity += 1;
            } else {
              cart.push({ ...product, quantity: 1 });
            }
            // Save to localStorage
            localStorage.setItem("cart", JSON.stringify(cart));
            // ✅ Ensure product is also marked as selected
            const selectedItems =
              JSON.parse(localStorage.getItem("selectedItems")) || [];
            if (!selectedItems.includes(product.id)) {
              selectedItems.push(product.id);
              localStorage.setItem(
                "selectedItems",
                JSON.stringify(selectedItems)
              );
            }

            // ✅ Update cart count in DOM
            const cartCountEl = document.querySelector(".cart-count");
            if (cartCountEl) {
              const totalItems = cart.reduce(
                (sum, item) => sum + (item.quantity || 1),
                0
              );
              cartCountEl.textContent = totalItems;
            }

            // ✅ Show toast
            toast.success(`${product.name} added to cart`, {
              position: "top-right",
              autoClose: 2000,
              hideProgressBar: false,
              closeOnClick: true,
              pauseOnHover: true,
              draggable: true,
            });
          }}
        >
          Add to Cart
        </button>
      </div>
    );
  };

  return (
    <>
      <div className="homepage">
        {/* Hero Section */}
        <section className="hero-banner">
          <div className="hero-image-container">
            <img
              src={slides[currentSlide].image}
              alt={slides[currentSlide].title}
              className={`hero-image ${isTransitioning ? "fading" : ""} ${
                imageLoaded ? "loaded" : ""
              }`}
              loading="eager"
              onLoad={() => setImageLoaded(true)}
              onError={(e) => {
                console.error("Failed to load image:", e.target.src);
                e.target.src =
                  "https://via.placeholder.com/1200x400?text=Image+Not+Available";
              }}
            />
            {!imageLoaded && (
              <div className="image-loading-placeholder">
                <div className="loading-spinner"></div>
              </div>
            )}
          </div>

          <div className="hero-caption">
            <h2>{slides[currentSlide].title}</h2>
            <p>{slides[currentSlide].description}</p>
          </div>

          <div className="hero-controls">
            <button
              onClick={prevSlide}
              aria-label="Previous slide"
              className="hero-control-btn"
            >
              &#10094;
            </button>
            <button
              onClick={nextSlide}
              aria-label="Next slide"
              className="hero-control-btn"
            >
              &#10095;
            </button>
          </div>

          <div className="slide-indicators">
            {slides.map((_, index) => (
              <button
                key={index}
                className={`indicator ${
                  index === currentSlide ? "active" : ""
                }`}
                onClick={() => {
                  if (!isTransitioning && index !== currentSlide) {
                    setIsTransitioning(true);
                    setImageLoaded(false);
                    setCurrentSlide(index);
                  }
                }}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>
        </section>

        {/* Top Deals Section */}
        <section id="category-Top Deals" className="product-section">
          <h2>Top Deals</h2>
          <div className="product-grid">
            {loading
              ? Array.from({ length: 4 }).map((_, i) =>
                  renderProductCard({}, i)
                )
              : topDeals.map(renderProductCard)}
          </div>
        </section>

        {/* Grouped Other Products by Category */}
        {!loading &&
          Object.entries(
            otherProducts.reduce((acc, product) => {
              const category = product.category_name || "Uncategorized";
              if (!acc[category]) acc[category] = [];
              acc[category].push(product);
              return acc;
            }, {})
          ).map(([category, products]) => (
            <CategorySection
              key={category}
              category={category}
              products={products}
              renderProductCard={renderProductCard}
            />
          ))}
      </div>
    </>
  );
};

export default HomePage;
