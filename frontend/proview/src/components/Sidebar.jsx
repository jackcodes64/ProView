import { useState, useRef, useEffect } from 'react';
import { Cpu, ExternalLink, Bell, ShieldAlert, Trash2, CheckCircle } from 'lucide-react';

export default function Sidebar({ sidebarItems, activeTab, setActiveTab, notifications, setNotifications }) {
  const [showNotifications, setShowNotifications] = useState(false);
  const notificationRef = useRef(null);

  const unreadCount = notifications.filter(n => !n.read).length;

  useEffect(() => {
    function handleClickOutside(event) {
      if (notificationRef.current && !notificationRef.current.contains(event.target)) {
        setShowNotifications(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const clearNotifications = () => {
    setNotifications([]);
    setShowNotifications(false);
  };

  const toggleRead = (id) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: !n.read } : n));
  };

  return (
    <aside className="sidebar">
      <div className="sidebar-header">

        <div className="logo-container">
          <div className="logo-icon">
            <Cpu size={20} />
          </div>
          <span>ProView</span>
        </div>

        <nav className="nav-menu">

          {sidebarItems.map((item) => (
            <button
              key={item.name}
              onClick={() => setActiveTab(item.name)}
              className={`sidebar-link ${activeTab === item.name ? 'active' : ''}`}
            >
              <item.icon size={18} />
              <span>{item.name}</span>
            </button>
          ))}
          
        </nav>
      </div>

      <div className="sidebar-footer">
        <div className="sidebar-actions" ref={notificationRef}>
          <button 
            className={`sidebar-action-btn ${showNotifications ? 'active' : ''}`}
            onClick={() => setShowNotifications(!showNotifications)}
          >
            <Bell size={18} />
            {unreadCount > 0 && (
              <span className="sidebar-badge">{unreadCount}</span>
            )}
            <span>Alerts</span>
          </button>

          {showNotifications && (
            <div className="sidebar-notification-dropdown">
              <div className="dropdown-header">
                <h3>System Alerts</h3>
                <div className="dropdown-actions">
                  <button onClick={markAllAsRead} title="Mark all as read">
                    <CheckCircle size={14} />
                  </button>
                  <button onClick={clearNotifications} title="Clear all">
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
              <div className="dropdown-body">
                {notifications.length === 0 ? (
                  <div className="empty-notifications">
                    <Bell size={24} />
                    <p>No active alerts</p>
                  </div>
                ) : (
                  notifications.map(n => (
                    <div 
                      key={n.id} 
                      className={`notification-item ${n.read ? 'read' : ''} ${n.type}`}
                      onClick={() => toggleRead(n.id)}
                    >
                      <div className="notification-icon">
                        <ShieldAlert size={16} />
                      </div>
                      <div className="notification-content">
                        <p className="notification-msg">{n.message}</p>
                        <span className="notification-time">
                          {new Date(n.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      {!n.read && <div className="unread-indicator"></div>}
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        <a 
          href="https://baremetals.co.ke" 
          target="_blank" 
          rel="noopener noreferrer"
          className="footer-link"
        >
          <span className='olasi'>Designed by OlasiKnight</span>
          <ExternalLink size={12} />
        </a>
      </div>
    </aside>
  );
}
