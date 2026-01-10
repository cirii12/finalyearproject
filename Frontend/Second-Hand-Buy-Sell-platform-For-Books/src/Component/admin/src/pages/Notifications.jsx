import React, { useState, useEffect } from 'react';
import {
    getPagedNotifications,
    markNotificationAsRead,
    clearAllNotifications,
    markAllNotificationsAsRead
} from '../services/api';
import {
    Bell,
    Trash2,
    CheckCircle2,
    Clock,
    ChevronLeft,
    ChevronRight,
    MoreVertical
} from 'lucide-react';
import { toast } from 'react-toastify';

export default function Notifications() {
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [totalElements, setTotalElements] = useState(0);
    const [size] = useState(10);

    const fetchNotifications = async () => {
        setLoading(true);
        try {
            const data = await getPagedNotifications(page, size);
            setNotifications(data.content || []);
            setTotalPages(data.totalPages || 0);
            setTotalElements(data.totalElements || 0);
        } catch (error) {
            console.error('Error fetching notifications:', error);
            toast.error('Failed to load notifications');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchNotifications();
    }, [page]);

    const handleMarkAsRead = async (id) => {
        try {
            await markNotificationAsRead(id);
            setNotifications(notifications.map(n =>
                n.id === id ? { ...n, isRead: true } : n
            ));
        } catch (error) {
            console.error('Error marking as read:', error);
        }
    };

    const handleMarkAllAsRead = async () => {
        try {
            await markAllNotificationsAsRead();
            setNotifications(notifications.map(n => ({ ...n, isRead: true })));
            toast.success('All notifications marked as read');
        } catch (error) {
            console.error('Error marking all as read:', error);
            toast.error('Failed to mark all as read');
        }
    };

    const handleClearAll = async () => {
        if (window.confirm('Are you sure you want to clear all notifications?')) {
            try {
                await clearAllNotifications();
                setNotifications([]);
                setTotalElements(0);
                setTotalPages(0);
                toast.success('All notifications cleared');
            } catch (error) {
                console.error('Error clearing notifications:', error);
                toast.error('Failed to clear notifications');
            }
        }
    };

    return (
        <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
            <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '24px'
            }}>
                <div>
                    <h1 style={{ fontSize: '24px', fontWeight: '700', color: '#111827', margin: 0 }}>
                        Notifications
                    </h1>
                    <p style={{ color: '#6b7280', fontSize: '14px', marginTop: '4px' }}>
                        You have {totalElements} total notifications
                    </p>
                </div>
                <div style={{ display: 'flex', gap: '12px' }}>
                    <button
                        onClick={handleMarkAllAsRead}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            padding: '8px 16px',
                            backgroundColor: 'white',
                            border: '1px solid #e5e7eb',
                            borderRadius: '8px',
                            fontSize: '14px',
                            fontWeight: '500',
                            color: '#374151',
                            cursor: 'pointer',
                            transition: 'all 0.2s'
                        }}
                        onMouseEnter={(e) => e.target.style.backgroundColor = '#f9fafb'}
                        onMouseLeave={(e) => e.target.style.backgroundColor = 'white'}
                    >
                        <CheckCircle2 size={18} />
                        Mark all as read
                    </button>
                    <button
                        onClick={handleClearAll}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            padding: '8px 16px',
                            backgroundColor: '#fee2e2',
                            border: '1px solid #fecaca',
                            borderRadius: '8px',
                            fontSize: '14px',
                            fontWeight: '500',
                            color: '#dc2626',
                            cursor: 'pointer',
                            transition: 'all 0.2s'
                        }}
                        onMouseEnter={(e) => e.target.style.backgroundColor = '#fecaca'}
                        onMouseLeave={(e) => e.target.style.backgroundColor = '#fee2e2'}
                    >
                        <Trash2 size={18} />
                        Clear all
                    </button>
                </div>
            </div>

            <div style={{
                backgroundColor: 'white',
                borderRadius: '12px',
                boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                overflow: 'hidden',
                border: '1px solid #e5e7eb'
            }}>
                {loading ? (
                    <div style={{ padding: '60px', textAlign: 'center', color: '#6b7280' }}>
                        Loading notifications...
                    </div>
                ) : notifications.length === 0 ? (
                    <div style={{ padding: '60px', textAlign: 'center' }}>
                        <div style={{
                            width: '64px',
                            height: '64px',
                            backgroundColor: '#f3f4f6',
                            borderRadius: '50%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            margin: '0 auto 16px'
                        }}>
                            <Bell size={32} color="#9ca3af" />
                        </div>
                        <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#374151' }}>No notifications yet</h3>
                        <p style={{ color: '#6b7280' }}>When you get notifications, they will appear here.</p>
                    </div>
                ) : (
                    <div>
                        {notifications.map((notif) => (
                            <div
                                key={notif.id}
                                onClick={() => !notif.isRead && handleMarkAsRead(notif.id)}
                                style={{
                                    padding: '20px 24px',
                                    borderBottom: '1px solid #f3f4f6',
                                    backgroundColor: notif.isRead ? 'white' : '#f0f7ff',
                                    cursor: notif.isRead ? 'default' : 'pointer',
                                    transition: 'background-color 0.2s',
                                    display: 'flex',
                                    gap: '16px'
                                }}
                            >
                                <div style={{
                                    width: '40px',
                                    height: '40px',
                                    backgroundColor: notif.isRead ? '#f3f4f6' : '#dbeafe',
                                    borderRadius: '50%',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    flexShrink: 0
                                }}>
                                    <Bell size={20} color={notif.isRead ? '#9ca3af' : '#3b82f6'} />
                                </div>
                                <div style={{ flex: 1 }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                        <h4 style={{
                                            fontSize: '16px',
                                            fontWeight: notif.isRead ? '500' : '600',
                                            color: '#111827',
                                            margin: 0
                                        }}>
                                            {notif.title}
                                        </h4>
                                        <span style={{
                                            fontSize: '12px',
                                            color: '#9ca3af',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '4px'
                                        }}>
                                            <Clock size={12} />
                                            {new Date(notif.createdAt).toLocaleString()}
                                        </span>
                                    </div>
                                    <p style={{
                                        fontSize: '14px',
                                        color: notif.isRead ? '#6b7280' : '#4b5563',
                                        marginTop: '4px',
                                        lineHeight: '1.5',
                                        margin: '4px 0 0'
                                    }}>
                                        {notif.message}
                                    </p>
                                </div>
                            </div>
                        ))}

                        {/* Pagination */}
                        {totalPages > 1 && (
                            <div style={{
                                padding: '16px 24px',
                                borderTop: '1px solid #f3f4f6',
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                backgroundColor: '#f9fafb'
                            }}>
                                <span style={{ fontSize: '14px', color: '#6b7280' }}>
                                    Showing {page * size + 1} to {Math.min((page + 1) * size, totalElements)} of {totalElements}
                                </span>
                                <div style={{ display: 'flex', gap: '8px' }}>
                                    <button
                                        disabled={page === 0}
                                        onClick={() => setPage(p => p - 1)}
                                        style={{
                                            padding: '6px',
                                            borderRadius: '6px',
                                            border: '1px solid #e5e7eb',
                                            backgroundColor: page === 0 ? '#f3f4f6' : 'white',
                                            cursor: page === 0 ? 'not-allowed' : 'pointer',
                                            color: page === 0 ? '#9ca3af' : '#374151'
                                        }}
                                    >
                                        <ChevronLeft size={20} />
                                    </button>
                                    {[...Array(totalPages)].map((_, i) => (
                                        <button
                                            key={i}
                                            onClick={() => setPage(i)}
                                            style={{
                                                width: '32px',
                                                height: '32px',
                                                borderRadius: '6px',
                                                border: '1px solid #e5e7eb',
                                                backgroundColor: page === i ? '#3b82f6' : 'white',
                                                color: page === i ? 'white' : '#374151',
                                                cursor: 'pointer',
                                                fontSize: '14px',
                                                fontWeight: '500'
                                            }}
                                        >
                                            {i + 1}
                                        </button>
                                    ))}
                                    <button
                                        disabled={page === totalPages - 1}
                                        onClick={() => setPage(p => p + 1)}
                                        style={{
                                            padding: '6px',
                                            borderRadius: '6px',
                                            border: '1px solid #e5e7eb',
                                            backgroundColor: page === totalPages - 1 ? '#f3f4f6' : 'white',
                                            cursor: page === totalPages - 1 ? 'not-allowed' : 'pointer',
                                            color: page === totalPages - 1 ? '#9ca3af' : '#374151'
                                        }}
                                    >
                                        <ChevronRight size={20} />
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
