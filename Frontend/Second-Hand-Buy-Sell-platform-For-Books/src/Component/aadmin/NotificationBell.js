import React, { useState, useEffect, useCallback, useRef } from 'react';
import { getAuthHeaders } from '../../services/api';
import './NotificationBell.css';

const NotificationBell = () => {
    const [unreadCount, setUnreadCount] = useState(0);
    const [notifications, setNotifications] = useState([]);
    const [showDropdown, setShowDropdown] = useState(false);
    const [loading, setLoading] = useState(false);
    const dropdownRef = useRef(null);

    const fetchUnreadCount = useCallback(async () => {
        try {
            const response = await fetch('http://localhost:8082/api/notifications/count', {
                headers: getAuthHeaders()
            });
            if (response.ok) {
                const data = await response.json();
                setUnreadCount(data.unreadCount || 0);
            }
        } catch (error) {
            console.error('Error fetching notification count:', error);
        }
    }, []);

    const fetchRecentNotifications = useCallback(async () => {
        setLoading(true);
        try {
            // Fetch top 5 recent notifications (including read ones)
            const response = await fetch('http://localhost:8082/api/notifications?page=0&size=5', {
                headers: getAuthHeaders()
            });
            if (response.ok) {
                const data = await response.json();
                setNotifications(data.content || []);
            }
        } catch (error) {
            console.error('Error fetching notifications:', error);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchUnreadCount();
        const interval = setInterval(fetchUnreadCount, 30000); // Check every 30s
        return () => clearInterval(interval);
    }, [fetchUnreadCount]);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setShowDropdown(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const toggleDropdown = () => {
        if (!showDropdown) {
            fetchRecentNotifications();
        }
        setShowDropdown(!showDropdown);
    };

    const markAsRead = async (id, e) => {
        e.stopPropagation();
        try {
            const response = await fetch(`http://localhost:8082/api/notifications/${id}/read`, {
                method: 'PUT',
                headers: getAuthHeaders()
            });
            if (response.ok) {
                setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
                setUnreadCount(prev => Math.max(0, prev - 1));
            }
        } catch (error) {
            console.error('Error marking notification as read:', error);
        }
    };

    const clearAll = async () => {
        if (window.confirm('Are you sure you want to clear all notifications?')) {
            try {
                const response = await fetch('http://localhost:8082/api/notifications/clear-all', {
                    method: 'DELETE',
                    headers: getAuthHeaders()
                });
                if (response.ok) {
                    setNotifications([]);
                    setUnreadCount(0);
                    setShowDropdown(false);
                }
            } catch (error) {
                console.error('Error clearing notifications:', error);
            }
        }
    };

    return (
        <div className="notification-bell-container" ref={dropdownRef}>
            <button className="notification-bell-btn" onClick={toggleDropdown}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
                    <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
                </svg>
                {unreadCount > 0 && <span className="notification-badge">{unreadCount}</span>}
            </button>

            {showDropdown && (
                <div className="notification-dropdown">
                    <div className="dropdown-header">
                        <h3>Notifications</h3>
                        <div className="header-actions">
                            <button className="clear-all-btn" onClick={clearAll}>Clear All</button>
                        </div>
                    </div>
                    <div className="dropdown-content">
                        {loading ? (
                            <div className="dropdown-message">Loading...</div>
                        ) : notifications.length === 0 ? (
                            <div className="dropdown-message">No notifications</div>
                        ) : (
                            notifications.map(notification => (
                                <div
                                    key={notification.id}
                                    className={`dropdown-item ${!notification.isRead ? 'unread' : ''}`}
                                    onClick={(e) => !notification.isRead && markAsRead(notification.id, e)}
                                >
                                    <div className="item-content">
                                        <p className="item-title">{notification.title}</p>
                                        <p className="item-text">{notification.message}</p>
                                        <p className="item-time">{new Date(notification.createdAt).toLocaleString()}</p>
                                    </div>
                                    {!notification.isRead && (
                                        <button className="mark-read-btn" onClick={(e) => markAsRead(notification.id, e)}>
                                            Read
                                        </button>
                                    )}
                                </div>
                            ))
                        )}
                    </div>
                    <div className="dropdown-footer">
                        <span className="view-all-link" onClick={() => { setShowDropdown(false); window.location.href = '/organization-notifications'; }}>
                            View All Notifications
                        </span>
                    </div>
                </div>
            )}
        </div>
    );
};

export default NotificationBell;
