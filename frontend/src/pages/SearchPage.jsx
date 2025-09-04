// src/SearchPage.jsx
import React, { useState, useEffect } from "react";
import Fuse from "fuse.js";
import { useNavigate } from "react-router-dom";

const SearchPage = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [topDeals, setTopDeals] = useState([]);
  const [otherProducts, setOtherProducts] = useState([]);
  const navigate = useNavigate();

  // fetch products
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
      })
      .catch((err) => console.error("Failed to fetch products:", err));
  }, []);

  // listen to external input
  useEffect(() => {
    const input = document.getElementById("header-search-input");
    if (!input) return;
    const handleInput = (e) => setSearchTerm(e.target.value);
    input.addEventListener("input", handleInput);
    return () => input.removeEventListener("input", handleInput);
  }, []);

  // run fuzzy search
  useEffect(() => {
    if (!searchTerm) {
      setSearchResults([]);
      return;
    }

    const productCategories = Array.from(
      new Set(
        [...topDeals, ...otherProducts]
          .map((p) => p.category_name)
          .filter(Boolean)
      )
    ).map((name) => ({ type: "category", name }));

    const searchable = [
      ...topDeals.map((p) => ({ type: "product", ...p })),
      ...otherProducts.map((p) => ({ type: "product", ...p })),
      ...productCategories,
    ];

    const fuse = new Fuse(searchable, {
      keys: ["name"],
      threshold: 0.4,
    });

    const results = fuse.search(searchTerm).map((r) => r.item);
    setSearchResults(results.slice(0, 10));
  }, [searchTerm, topDeals, otherProducts]);

  // inject results into the existing container
  useEffect(() => {
    const suggestionsDiv = document.getElementById("header-search-suggestions");
    if (!suggestionsDiv) return;

    suggestionsDiv.innerHTML = "";

    if (searchResults.length > 0) {
      searchResults.forEach((item) => {
        const div = document.createElement("div");
        div.className = "search-suggestion-item";
        div.textContent =
          item.type === "category" ? `Category: ${item.name}` : item.name;

        div.onclick = () => {
          if (item.type === "category") {
            // ✅ Scroll to category
            navigate(`/?scrollTo=${encodeURIComponent(item.name)}`);
          } else {
            // ✅ Scroll to product’s category
            const category = item.category_name || "Uncategorized";
            navigate(`/?scrollTo=${encodeURIComponent(category)}`);

            // Optionally: auto-highlight or open product modal here
          }
          // clear suggestions
          suggestionsDiv.innerHTML = "";
          setSearchTerm("");
        };

        suggestionsDiv.appendChild(div);
      });
    }
  }, [searchResults, navigate]);

  return null; // no UI of its own
};

export default SearchPage;
