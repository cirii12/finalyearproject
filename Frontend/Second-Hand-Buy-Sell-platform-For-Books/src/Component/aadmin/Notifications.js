import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { getAuthHeaders } from '../../services/api';
import { showLogoutConfirmation } from '../ConfirmationToast';
import NotificationBell from './NotificationBell';
import './Adminpanel.css'; // Reuse admin panel styles for the layout

const Notifications = () => {
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const storedUser = JSON.parse(sessionStorage.getItem('user') || '{}');
        const userType = storedUser.userType?.toLowerCase();

        if (!storedUser.token || userType !== 'organization') {
            toast.error('Access denied. Organization login required.');
            navigate('/login');
            return;
        }

        setUser(storedUser);
    }, [navigate]);

    const loadAllNotifications = useCallback(async () => {
        try {
            setLoading(true);
            const response = await fetch('http://localhost:8082/api/notifications', {
                headers: getAuthHeaders()
            });

            if (response.ok) {
                const data = await response.json();
                setNotifications(data.content || []);
            }
        } catch (error) {
            console.error('Error loading all notifications:', error);
            toast.error('Failed to load notifications');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        if (user) {
            loadAllNotifications();
        }
    }, [user, loadAllNotifications]);

    const markAsRead = async (id, e) => {
        if (e) e.stopPropagation();
        try {
            const response = await fetch(`http://localhost:8082/api/notifications/${id}/read`, {
                method: 'PUT',
                headers: getAuthHeaders()
            });
            if (response.ok) {
                setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
                toast.success('Notification marked as read');
            }
        } catch (error) {
            console.error('Error marking notification as read:', error);
        }
    };

    const handleLogout = () => {
        const performLogout = () => {
            sessionStorage.removeItem('user');
            navigate('/login');
        };
        showLogoutConfirmation(performLogout);
    };

    if (!user) return null;

    return (
        <div className="admin-panel-page">
            <header className="admin-panel-header">
                <div className="admin-header-content">
                    <div className="admin-logo-section">
                        <h1 className="admin-logo">Lunasu Crochet</h1>
                        <span className="admin-badge">Organization Panel</span>
                    </div>
                    <div className="admin-header-actions">
                        <NotificationBell />
                        <button className="admin-orders-btn" onClick={() => navigate('/adminpanel')}>
                            Back to Panel
                        </button>
                        <span className="admin-user-name">{user.fullName || user.email}</span>
                        <button className="admin-logout-btn" onClick={handleLogout}>
                            Logout
                        </button>
                    </div>
                </div>
            </header>

            <main className="admin-panel-main" style={{ maxWidth: '900px', margin: '40px auto' }}>
                <div className="admin-form-header">
                    <h1>Organization Notifications</h1>
                    <p>Manage and track all your system notifications</p>
                </div>

                <div className="admin-notifications-container" style={{ background: '#fff', borderRadius: '12px', padding: '24px', boxShadow: '0 4px 16px rgba(0,0,0,0.08)' }}>
                    {loading ? (
                        <div style={{ textAlign: 'center', padding: '40px' }}>Loading notifications...</div>
                    ) : notifications.length === 0 ? (
                        <div style={{ textAlign: 'center', padding: '40px' }}>
                            <div style={{ fontSize: '48px', marginBottom: '16px' }}>🔔</div>
                            <div style={{ color: '#666' }}>No notifications yet</div>
                        </div>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                            {notifications.map(notification => (
                                <div key={notification.id} style={{
                                    border: '1px solid #e0e0e0',
                                    borderRadius: '8px',
                                    padding: '16px',
                                    background: notification.isRead ? '#f8f9fa' : '#fff',
                                    borderLeft: notification.isRead ? '4px solid #6c757d' : '4px solid #E94E8B',
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center'
                                }}>
                                    <div>
                                        <h4 style={{ margin: '0 0 4px 0', fontSize: '16px' }}>{notification.title}</h4>
                                        <p style={{ margin: '0 0 4px 0', color: '#666', fontSize: '14px' }}>{notification.message}</p>
                                        <span style={{ fontSize: '12px', color: '#999' }}>{new Date(notification.createdAt).toLocaleString()}</span>
                                    </div>
                                    {!notification.isRead && (
                                        <button
                                            onClick={() => markAsRead(notification.id)}
                                            style={{
                                                background: '#E94E8B',
                                                color: '#fff',
                                                border: 'none',
                                                borderRadius: '4px',
                                                padding: '6px 12px',
                                                fontSize: '12px',
                                                cursor: 'pointer'
                                            }}
                                        >
                                            Mark Read
                                        </button>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
};

export default Notifications;
