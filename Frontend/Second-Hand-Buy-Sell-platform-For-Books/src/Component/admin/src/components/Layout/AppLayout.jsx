import React, { useState, useEffect, useRef } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  BookOpen,
  ShoppingCart,
  LogOut,
  Menu,
  X,
  Shield,
  BarChart3,
  Bell
} from 'lucide-react';
import {
  adminLogout,
  getUnreadNotifications,
  markNotificationAsRead,
  getRecentNotifications,
  clearAllNotifications,
  markAllNotificationsAsRead,
  getActiveOrdersCount
} from '../../services/api';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export default function AppLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [notificationOpen, setNotificationOpen] = useState(false);
  const [activeOrdersCount, setActiveOrdersCount] = useState(0);
  const notificationRef = useRef(null);
  const notificationsRef = useRef([]);

  const navigation = [
    { label: 'Dashboard', path: '/admin', icon: LayoutDashboard },
    { label: 'Users', path: '/admin/users', icon: Users },
    // { label: 'Products', path: '/admin/books', icon: BookOpen },
    { label: 'Orders', path: '/admin/orders', icon: ShoppingCart, badge: activeOrdersCount },
    { label: 'Analytics', path: '/admin/analytics', icon: BarChart3 },
  ];

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000);

    // Click outside handler for notification dropdown
    const handleClickOutside = (event) => {
      if (notificationRef.current && !notificationRef.current.contains(event.target)) {
        setNotificationOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      clearInterval(interval);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const fetchNotifications = async () => {
    try {
      // Get unread count for badge
      const unreadResponse = await getUnreadNotifications();
      if (unreadResponse) {
        setUnreadCount(unreadResponse.unreadCount);

        // Show toast for NEW notifications
        const currentNotifications = notificationsRef.current;
        const newNotifications = unreadResponse.notifications.filter(
          newMsg => !currentNotifications.some(oldMsg => oldMsg.id === newMsg.id)
        );

        if (newNotifications.length > 0 && currentNotifications.length >= 0) {
          newNotifications.forEach(notif => {
            toast.info(`${notif.title}: ${notif.message}`, {
              position: "top-right",
              autoClose: 5000,
              icon: "🔔"
            });
          });
        }
      }

      // Get recent notifications for dropdown (both read and unread)
      const recentResponse = await getRecentNotifications(5);
      if (recentResponse && recentResponse.notifications) {
        setNotifications(recentResponse.notifications);
        notificationsRef.current = recentResponse.notifications;
      }

      // Get active orders count
      const ordersCountRes = await getActiveOrdersCount();
      if (ordersCountRes && typeof ordersCountRes.count === 'number') {
        setActiveOrdersCount(ordersCountRes.count);
      }
    } catch (error) {
      console.error("Failed to fetch notifications:", error);
    }
  };

  const handleClearAll = async () => {
    if (window.confirm('Are you sure you want to clear all notifications?')) {
      try {
        await clearAllNotifications();
        toast.success("Notifications cleared");
        fetchNotifications();
      } catch (error) {
        console.error("Failed to clear notifications:", error);
        toast.error("Failed to clear notifications");
      }
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await markAllNotificationsAsRead();
      fetchNotifications();
    } catch (error) {
      console.error("Failed to mark all as read:", error);
    }
  };

  const handleMarkAsRead = async (id) => {
    try {
      await markNotificationAsRead(id);
      fetchNotifications();
    } catch (error) {
      console.error("Failed to mark notification as read:", error);
    }
  };

  const handleLogout = async () => {
    try {
      await adminLogout();
      navigate('/admin/login');
    } catch (error) {
      console.error('Logout failed:', error);
      navigate('/admin/login');
    }
  };

  const isActive = (path) => {
    if (path === '/admin') {
      return location.pathname === '/admin';
    }
    return location.pathname.startsWith(path);
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      {/* Sidebar */}
      <div style={{
        width: sidebarOpen ? '280px' : '0',
        background: 'linear-gradient(180deg, #1e293b 0%, #334155 100%)',
        color: 'white',
        transition: 'width 0.3s ease',
        overflow: 'hidden',
        position: 'fixed',
        height: '100vh',
        zIndex: 1000
      }}>
        <div style={{ padding: '24px' }}>
          {/* Logo */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '32px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <Shield style={{ width: '32px', height: '32px', color: '#3b82f6' }} />
              <h1 style={{
                fontSize: '20px',
                fontWeight: 'bold',
                margin: 0,
                background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent'
              }}>
                Lunasu Crochet Admin
              </h1>
            </div>
            <button
              onClick={() => setSidebarOpen(false)}
              style={{
                background: 'none',
                border: 'none',
                color: 'white',
                cursor: 'pointer',
                padding: '4px'
              }}
            >
              <X style={{ width: '20px', height: '20px' }} />
            </button>
          </div>

          {/* Navigation */}
          <nav style={{ marginBottom: '32px' }}>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
              {navigation.map((item) => {
                const Icon = item.icon;
                const active = isActive(item.path);
                return (
                  <li key={item.label} style={{ marginBottom: '8px' }}>
                    <button
                      onClick={() => navigate(item.path)}
                      style={{
                        width: '100%',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px',
                        padding: '12px 16px',
                        background: active ? 'rgba(59, 130, 246, 0.2)' : 'transparent',
                        border: 'none',
                        borderRadius: '8px',
                        color: active ? '#3b82f6' : 'white',
                        cursor: 'pointer',
                        transition: 'all 0.3s ease',
                        textAlign: 'left',
                        fontSize: '14px',
                        fontWeight: active ? '600' : '500'
                      }}
                      onMouseEnter={(e) => {
                        if (!active) {
                          e.target.style.background = 'rgba(255, 255, 255, 0.1)';
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (!active) {
                          e.target.style.background = 'transparent';
                        }
                      }}
                    >
                      <Icon style={{ width: '20px', height: '20px' }} />
                      <span>{item.label}</span>
                      {item.badge > 0 && (
                        <span style={{
                          marginLeft: 'auto',
                          backgroundColor: '#ef4444',
                          color: 'white',
                          fontSize: '11px',
                          fontWeight: '700',
                          padding: '2px 6px',
                          borderRadius: '10px',
                          minWidth: '18px',
                          textAlign: 'center'
                        }}>
                          {item.badge}
                        </span>
                      )}
                    </button>
                  </li>
                );
              })}
            </ul>
          </nav>

          {/* Logout */}
          <div style={{
            position: 'absolute',
            bottom: '24px',
            left: '24px',
            right: '24px'
          }}>
            <button
              onClick={handleLogout}
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '12px 16px',
                background: 'rgba(239, 68, 68, 0.2)',
                border: '1px solid rgba(239, 68, 68, 0.3)',
                borderRadius: '8px',
                color: '#fca5a5',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                fontSize: '14px',
                fontWeight: '500'
              }}
              onMouseEnter={(e) => {
                e.target.style.background = 'rgba(239, 68, 68, 0.3)';
              }}
              onMouseLeave={(e) => {
                e.target.style.background = 'rgba(239, 68, 68, 0.2)';
              }}
            >
              <LogOut style={{ width: '20px', height: '20px' }} />
              Logout
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div style={{
        flex: 1,
        marginLeft: sidebarOpen ? '280px' : '0',
        transition: 'margin-left 0.3s ease',
        background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
        minHeight: '100vh'
      }}>
        {/* Top Bar */}
        <div style={{
          background: 'white',
          padding: '16px 24px',
          borderBottom: '1px solid #e5e7eb',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                padding: '8px',
                borderRadius: '6px',
                color: '#6b7280'
              }}
              onMouseEnter={(e) => {
                e.target.style.background = '#f3f4f6';
              }}
              onMouseLeave={(e) => {
                e.target.style.background = 'transparent';
              }}
            >
              <Menu style={{ width: '20px', height: '20px' }} />
            </button>
            <h2 style={{
              fontSize: '18px',
              fontWeight: '600',
              color: '#1f2937',
              margin: 0
            }}>
              {navigation.find(item => isActive(item.href))?.name || 'Dashboard'}
            </h2>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>

            {/* Notification Bell */}
            <div style={{ position: 'relative' }} ref={notificationRef}>
              <button
                onClick={() => setNotificationOpen(!notificationOpen)}
                style={{
                  background: 'white',
                  padding: '4px',
                  borderRadius: '50%',
                  color: '#9ca3af',
                  border: 'none',
                  cursor: 'pointer',
                  position: 'relative',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
                onMouseEnter={(e) => e.target.style.color = '#6b7280'}
                onMouseLeave={(e) => e.target.style.color = '#9ca3af'}
              >
                <Bell style={{ width: '24px', height: '24px' }} />
                {unreadCount > 0 && (
                  <span style={{
                    position: 'absolute',
                    top: 0,
                    right: 0,
                    display: 'block',
                    width: '8px',
                    height: '8px',
                    borderRadius: '50%',
                    backgroundColor: '#ef4444',
                    border: '2px solid white'
                  }} />
                )}
              </button>

              {notificationOpen && (
                <div style={{
                  position: 'absolute',
                  right: 0,
                  top: '100%',
                  marginTop: '8px',
                  width: '320px',
                  backgroundColor: 'white',
                  borderRadius: '8px',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
                  border: '1px solid #e5e7eb',
                  zIndex: 100
                }}>
                  <div style={{
                    padding: '12px 16px',
                    borderBottom: '1px solid #e5e7eb',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}>
                    <span style={{ fontWeight: '600', fontSize: '14px', color: '#111827' }}>Notifications</span>
                    <div style={{ display: 'flex', gap: '12px' }}>
                      {unreadCount > 0 && (
                        <button
                          onClick={handleMarkAllAsRead}
                          style={{
                            background: 'none',
                            border: 'none',
                            color: '#3b82f6',
                            fontSize: '12px',
                            cursor: 'pointer',
                            padding: 0
                          }}
                        >
                          Mark all as read
                        </button>
                      )}
                      <button
                        onClick={handleClearAll}
                        style={{
                          background: 'none',
                          border: 'none',
                          color: '#ef4444',
                          fontSize: '12px',
                          cursor: 'pointer',
                          padding: 0
                        }}
                      >
                        Clear all
                      </button>
                    </div>
                  </div>
                  <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
                    {notifications.length === 0 ? (
                      <div style={{ padding: '16px', textAlign: 'center', fontSize: '14px', color: '#6b7280' }}>
                        No new notifications
                      </div>
                    ) : (
                      notifications.map((notification) => (
                        <div
                          key={notification.id}
                          style={{
                            padding: '12px 16px',
                            borderBottom: '1px solid #f3f4f6',
                            cursor: 'pointer',
                            backgroundColor: notification.isRead ? 'white' : '#eff6ff',
                            position: 'relative'
                          }}
                          onClick={() => handleMarkAsRead(notification.id)}
                          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = notification.isRead ? '#f9fafb' : '#dbeafe'}
                          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = notification.isRead ? 'white' : '#eff6ff'}
                        >
                          {!notification.isRead && (
                            <div style={{
                              position: 'absolute',
                              left: '6px',
                              top: '20px',
                              width: '6px',
                              height: '6px',
                              borderRadius: '50%',
                              backgroundColor: '#3b82f6'
                            }} />
                          )}
                          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                            <span style={{ fontWeight: notification.isRead ? '500' : '600', fontSize: '14px', color: '#111827' }}>{notification.title}</span>
                            <span style={{ fontSize: '12px', color: '#9ca3af' }}>{new Date(notification.createdAt).toLocaleDateString()}</span>
                          </div>
                          <p style={{ fontSize: '14px', color: notification.isRead ? '#6b7280' : '#4b5563', margin: 0, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                            {notification.message}
                          </p>
                        </div>
                      ))
                    )}
                  </div>
                  <div style={{
                    padding: '8px 16px',
                    borderTop: '1px solid #e5e7eb',
                    textAlign: 'center'
                  }}>
                    <button
                      onClick={() => {
                        setNotificationOpen(false);
                        navigate('/admin/notifications');
                      }}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: '#3b82f6',
                        fontSize: '13px',
                        fontWeight: '500',
                        cursor: 'pointer'
                      }}
                    >
                      View All Notifications
                    </button>
                  </div>
                </div>
              )}
            </div>

            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '8px 12px',
              background: '#f3f4f6',
              borderRadius: '6px',
              fontSize: '14px',
              color: '#6b7280'
            }}>
              <div style={{
                width: '8px',
                height: '8px',
                background: '#10b981',
                borderRadius: '50%'
              }}></div>
              Admin Panel
            </div>
          </div>
        </div>

        {/* Page Content */}
        <div style={{ padding: '24px' }}>
          <Outlet />
        </div>

        <ToastContainer
          position="top-right"
          autoClose={5000}
          hideProgressBar={false}
          newestOnTop
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
          theme="light"
        />
      </div>

      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0, 0, 0, 0.5)',
            zIndex: 999,
            display: 'none'
          }}
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
} 