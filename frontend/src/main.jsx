import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <App />
  </StrictMode>
);

// ✅ Hide loader after React renders
const loader = document.getElementById("loader");
if (loader) {
  loader.style.display = "none";
}
