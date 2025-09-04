import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import "./css/OrdersPage.css";
import { useNavigate } from "react-router-dom";

const OrdersPage = () => {
  const [orders, setOrders] = useState([]);
  const [query, setQuery] = useState("");
  const [tab, setTab] = useState("all");
  const [range, setRange] = useState("3m");
  const token = localStorage.getItem("adminToken");
  const navigate = useNavigate(); // 👈 add this

  const parseDateEAT = (d) => {
    if (!d) return null;
    if (d instanceof Date) return d;

    // Parse as Date (defaults to UTC)
    const utcDate = new Date(d);

    // Convert to EAT (UTC+3)
    const eatDate = new Date(utcDate.getTime() + 3 * 60 * 60 * 1000);

    return eatDate;
  };

  function parseJwt(token) {
    try {
      return JSON.parse(atob(token.split(".")[1]));
    } catch (e) {
      return null;
    }
  }

  useEffect(() => {
    // 👇 if token missing or invalid, redirect to login
    if (!token) {
      navigate("/login");
      return;
    }

    const decoded = parseJwt(token);
    if (!decoded) {
      localStorage.removeItem("adminToken"); // clean up broken token
      navigate("/login");
      return;
    }

    const fetchOrders = async () => {
      try {
        const res = await axios.get(`/api/orders/${decoded.id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setOrders(res.data || []);
      } catch (err) {
        console.error(err);

        // If backend rejects the token (expired/invalid), force logout
        if (err.response?.status === 401) {
          localStorage.removeItem("adminToken");
          navigate("/login");
        }
      }
    };

    fetchOrders();
  }, [token, navigate]);

  const handleCancelOrder = async (orderNumber) => {
    try {
      await axios.put(
        `/api/orders/${orderNumber}/cancel`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      // update UI without refetch
      setOrders((prev) =>
        prev.map((o) =>
          o.order_number === orderNumber ? { ...o, status: "cancelled" } : o
        )
      );
    } catch (err) {
      console.error(err);
      alert("Failed to cancel order");
    }
  };

  const handleArchiveOrder = async (orderNumber) => {
    try {
      await axios.put(
        `/api/orders/${orderNumber}/archive`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setOrders((prev) =>
        prev.map((o) =>
          o.order_number === orderNumber ? { ...o, status: "archived" } : o
        )
      );
    } catch (err) {
      console.error(err);
      alert("Failed to archive order");
    }
  };

  // Helpers
  const normalizeItems = (order) => {
    // Accepts: array, JSON string, or plain string
    if (Array.isArray(order.items)) return order.items;
    if (typeof order.items === "string") {
      try {
        const parsed = JSON.parse(order.items);
        if (Array.isArray(parsed)) return parsed;
        if (parsed && Array.isArray(parsed.items)) return parsed.items;
        return [{ title: order.items }];
      } catch {
        return [{ title: order.items }];
      }
    }
    return [];
  };

  const currency = (order) => order.currency || "KES";
  const money = (num) =>
    typeof num === "number"
      ? num.toLocaleString()
      : Number(num || 0).toLocaleString();

  const formatMetaDate = (d) =>
    d.toLocaleDateString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
    });

  const deliveryLabel = (order) => {
    const s = String(order.status || "").toLowerCase();
    const expected = order.expected_delivery || order.delivery_date;
    if (expected) {
      const now = new Date();
      const d = new Date(expected);
      const msPerDay = 24 * 60 * 60 * 1000;
      const diff = Math.floor(
        (d.setHours(0, 0, 0, 0) - now.setHours(0, 0, 0, 0)) / msPerDay
      );
      if (diff < 0) {
        return `Delivered ${d.toLocaleDateString(undefined, {
          weekday: "long",
        })}`;
      }
      if (diff === 0) return "Arriving today";
      if (diff === 1) return "Arriving tomorrow";
      return `Arriving ${d.toLocaleDateString(undefined, {
        weekday: "short",
        month: "short",
        day: "numeric",
      })}`;
    }
    if (s === "success") return "Delivered";
    if (s === "pending") return "Arriving soon";
    if (s === "failed" || s === "cancelled") return "Cancelled";
    return order.status || "Processing";
  };

  const statusClass = (status) => {
    const s = String(status || "").toLowerCase();
    if (s === "pending") return "status-pending";
    if (s === "success") return "status-success";
    if (s === "failed" || s === "cancelled") return "status-failed";
    if (s === "archived") return "status-archived"; // 👈 add this
    return "";
  };

  // Filtering
  const rangeBounds = useMemo(() => {
    const now = new Date();
    switch (range) {
      case "30d": {
        const start = new Date(now);
        start.setDate(start.getDate() - 30);
        return { start, end: now };
      }
      case "3m": {
        const start = new Date(now);
        start.setMonth(start.getMonth() - 3);
        return { start, end: now };
      }
      case "6m": {
        const start = new Date(now);
        start.setMonth(start.getMonth() - 6);
        return { start, end: now };
      }
      case "y2025":
        return {
          start: new Date(2025, 0, 1),
          end: new Date(2025, 11, 31, 23, 59, 59),
        };
      case "y2024":
        return {
          start: new Date(2024, 0, 1),
          end: new Date(2024, 11, 31, 23, 59, 59),
        };
      case "all":
      default:
        return null;
    }
  }, [range]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();

    return (orders || [])
      .filter((o) => {
        if (!rangeBounds) return true;
        const created = parseDateEAT(o.created_at);
        return created >= rangeBounds.start && created <= rangeBounds.end;
      })

      .filter((o) => {
        const s = String(o.status || "").toLowerCase();

        if (tab === "all") return s !== "archived"; // 👈 exclude archived
        if (tab === "open")
          return s === "pending" || s === "processing" || s === "shipped";
        if (tab === "cancelled") return s === "failed" || s === "cancelled";
        if (tab === "archived") return s === "archived";

        return true;
      })

      .filter((o) => {
        if (!q) return true;
        const items = normalizeItems(o);
        const text =
          [
            o.order_number,
            o.payment_method,
            o.status,
            items.map((i) => i?.title || i?.name || "").join(" "),
          ]
            .join(" ")
            .toLowerCase() || "";
        return text.includes(q);
      })
      .sort((a, b) => parseDateEAT(b.created_at) - parseDateEAT(a.created_at)); // ✅ FIXED
  }, [orders, query, tab, range]);

  useEffect(() => {
    if (orders.length > 0) {
      console.log(
        "Created_at values:",
        orders.map((o) => o.created_at)
      );
    }
  }, [orders]);

  return (
    <div className="orders-page">
      <div className="orders-header">
        <h1>Your Orders</h1>
        <div className="orders-search">
          <input
            type="search"
            placeholder="Search all orders"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            aria-label="Search orders"
          />
        </div>
      </div>

      <div className="orders-tabs">
        <button
          className={tab === "all" ? "active" : ""}
          onClick={() => setTab("all")}
        >
          All Orders
        </button>
        <button
          className={tab === "open" ? "active" : ""}
          onClick={() => setTab("open")}
        >
          Open Orders
        </button>
        <button
          className={tab === "archived" ? "active" : ""}
          onClick={() => setTab("archived")}
        >
          Archived Orders
        </button>

        <button
          className={tab === "cancelled" ? "active" : ""}
          onClick={() => setTab("cancelled")}
        >
          Cancelled Orders
        </button>

        <div className="orders-range">
          <label>Orders placed in</label>
          <select value={range} onChange={(e) => setRange(e.target.value)}>
            <option value="30d">last 30 days</option>
            <option value="3m">past 3 months</option>
            <option value="6m">past 6 months</option>
            <option value="y2025">2025</option>
            <option value="y2024">2024</option>
            <option value="all">all orders</option>
          </select>
        </div>
      </div>

      {filtered.length === 0 ? (
        <p className="orders-empty">No orders found for the current filters.</p>
      ) : (
        <div className="orders-list">
          {filtered.map((order) => {
            const items = normalizeItems(order);
            const first = items[0] || {};
            const itemCount = items.length;

            return (
              <article className="order-card" key={order.order_number}>
                <header className="order-card__meta">
                  <div>
                    <div className="meta-label">ORDER PLACED</div>
                    <div className="meta-value">
                      {formatMetaDate(parseDateEAT(order.created_at))}
                    </div>
                  </div>
                  <div>
                    <div className="meta-label">TOTAL</div>
                    <div className="meta-value">
                      {currency(order)} {money(order.total_amount)}
                    </div>
                  </div>
                  <div>
                    <div className="meta-label">SHIP TO</div>
                    <div className="meta-value">{order.ship_to || "You"}</div>
                  </div>
                  <div className="order-card__number">
                    <div className="meta-label">ORDER #</div>
                    <div className="meta-value">{order.order_number}</div>
                  </div>
                  <div className="order-card__links">
                    <button className="link-like">Order details</button>
                    <span aria-hidden="true">|</span>
                    <button className="link-like">Invoice</button>
                  </div>
                </header>

                <div className="order-card__status">
                  <span className={`status-pill ${statusClass(order.status)}`}>
                    {order.status}
                  </span>
                  <span className="status-text">{deliveryLabel(order)}</span>
                </div>

                <div className="order-card__body">
                  <div className="order-thumb">
                    {first.image ? (
                      <img
                        src={first.image}
                        alt={first.title || first.name || "Item"}
                      />
                    ) : (
                      <div className="thumb-placeholder" aria-hidden="true">
                        🛍️
                      </div>
                    )}
                  </div>

                  <div className="order-info">
                    <a className="item-title" href={first.url || "#"}>
                      {first.title || first.name || "Item"}
                    </a>
                    {itemCount > 1 && (
                      <div className="item-sub">
                        + {itemCount - 1} more item
                        {itemCount - 1 > 1 ? "s" : ""}
                      </div>
                    )}
                    <div className="item-meta">
                      <span>Payment: {order.payment_method}</span>
                    </div>
                  </div>

                  <div className="order-actions">
                    {String(order.status).toLowerCase() !== "cancelled" && (
                      <button
                        className="btn btn-primary"
                        onClick={() =>
                          navigate(
                            `/order-confirmation/${order.order_number}/track`
                          )
                        }
                      >
                        Track package
                      </button>
                    )}

                    {order.status !== "Cancelled" &&
                      order.status !== "Success" &&
                      order.status !== "Delivered" && (
                        <button
                          className="btn"
                          onClick={() => handleCancelOrder(order.order_number)}
                        >
                          Cancel items
                        </button>
                      )}

                    <button
                      className="btn"
                      onClick={() =>
                        navigate(`/order-confirmation/${order.order_number}`)
                      }
                    >
                      View order
                    </button>

                    {order.status !== "archived" && (
                      <button
                        className="btn"
                        onClick={() => handleArchiveOrder(order.order_number)}
                      >
                        Archive order
                      </button>
                    )}
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default OrdersPage;
