import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { getContactMessages, markMessagesAsRead } from "../../services/api";
import NotificationBell from "./NotificationBell"; // Reuse if available
import "./Adminpanel.css"; // Reuse main styles for consistency

export default function Contactus() {
    const [messages, setMessages] = useState([]);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchMessages = async () => {
            setLoading(true);
            try {
                const data = await getContactMessages();
                setMessages(data);
                // Mark messages as read
                await markMessagesAsRead();
            } catch (err) {
                console.error(err);
                toast.error("Failed to load contact messages.");
            } finally {
                setLoading(false);
            }
        };
        fetchMessages();
    }, []);

    const formatDate = (dateString) => {
        if (!dateString) return "";
        return new Date(dateString).toLocaleDateString("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        });
    };

    return (
        <div className="admin-panel-page">
            {/* Header - Reusing Admin Panel Header Structure */}
            <header className="admin-panel-header">
                <div className="admin-header-content">
                    <div className="admin-logo-section">
                        <h1 className="admin-logo" onClick={() => navigate("/adminpanel")} style={{ cursor: "pointer" }}>
                            Lunasu Crochet
                        </h1>
                        <span className="admin-badge">Organization Panel</span>
                    </div>
                    <div className="admin-header-actions">
                        <NotificationBell />
                        <button className="admin-orders-btn" onClick={() => navigate("/adminpanel")}>
                            Back to Panel
                        </button>
                        <button className="admin-orders-btn" onClick={() => navigate("/organization-products")}>
                            Products
                        </button>
                        <button className="admin-logout-btn" onClick={() => navigate("/login")}>
                            Logout
                        </button>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="admin-panel-main" style={{ maxWidth: "1200px" }}>
                <div className="admin-form-header">
                    <div className="admin-form-icon">
                        <span style={{ fontSize: "2rem" }}>✉️</span>
                    </div>
                    <h1>Contact Messages</h1>
                    <p>View and manage inquiries from customers.</p>
                </div>

                {loading ? (
                    <div style={{ textAlign: "center", padding: "40px" }}>Loading messages...</div>
                ) : (
                    <div className="admin-book-form" style={{ overflowX: "auto" }}>
                        {messages.length === 0 ? (
                            <p style={{ textAlign: "center", color: "#6b7280" }}>No messages received yet.</p>
                        ) : (
                            <table style={{ width: "100%", borderCollapse: "collapse", minWidth: "800px" }}>
                                <thead>
                                    <tr style={{ background: "#f9fafb", textAlign: "left" }}>
                                        <th style={{ padding: "16px", borderBottom: "2px solid #e5e7eb", color: "#374151" }}>Date</th>
                                        <th style={{ padding: "16px", borderBottom: "2px solid #e5e7eb", color: "#374151" }}>Name</th>
                                        <th style={{ padding: "16px", borderBottom: "2px solid #e5e7eb", color: "#374151" }}>Type</th>
                                        <th style={{ padding: "16px", borderBottom: "2px solid #e5e7eb", color: "#374151" }}>Subject</th>
                                        <th style={{ padding: "16px", borderBottom: "2px solid #e5e7eb", color: "#374151" }}>Message</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {messages.map((msg) => (
                                        <tr key={msg.id} style={{ borderBottom: "1px solid #f3f4f6" }}>
                                            <td style={{ padding: "16px", color: "#6b7280", fontSize: "0.9rem" }}>{formatDate(msg.createdAt)}</td>
                                            <td style={{ padding: "16px" }}>
                                                <div style={{ fontWeight: "500", color: "#111827" }}>{msg.fullName}</div>
                                                <div style={{ fontSize: "0.85rem", color: "#6b7280" }}>{msg.email}</div>
                                            </td>
                                            <td style={{ padding: "16px" }}>
                                                <span
                                                    style={{
                                                        padding: "4px 10px",
                                                        borderRadius: "12px",
                                                        fontSize: "0.75rem",
                                                        fontWeight: "600",
                                                        background:
                                                            msg.inquiryType === "order"
                                                                ? "#e0f2fe"
                                                                : msg.inquiryType === "wholesale"
                                                                    ? "#fce7f3"
                                                                    : "#f3f4f6",
                                                        color:
                                                            msg.inquiryType === "order"
                                                                ? "#0284c7"
                                                                : msg.inquiryType === "wholesale"
                                                                    ? "#db2777"
                                                                    : "#4b5563",
                                                        textTransform: "capitalize",
                                                    }}
                                                >
                                                    {msg.inquiryType}
                                                </span>
                                            </td>
                                            <td style={{ padding: "16px", color: "#374151", fontWeight: "500" }}>{msg.subject}</td>
                                            <td style={{ padding: "16px", color: "#4b5563", maxWidth: "300px", lineHeight: "1.4" }}>
                                                {msg.message}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </div>
                )}
            </main>
        </div>
    );
}
