"use client";

import { useState } from "react";
import {
  LuBell as Bell,
  LuPackage as Package,
  LuActivity as Activity,
  LuSparkles as Sparkles,
  LuInfo as Info,
  LuCircleCheck as CheckCircle
} from "react-icons/lu";

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState([
    {
      id: 1,
      type: "stock",
      title: "Low Stock Alert",
      description: "Organic Tomatoes are running low in Inventory (only 12 boxes left). Auto-reorder suggestion available.",
      time: "2 hours ago",
      icon: Package,
      color: "var(--color-error)",
      bg: "rgba(239, 68, 68, 0.1)",
      read: false
    },
    {
      id: 2,
      type: "activity",
      title: "New Supplier Added",
      description: "Admin added 'Fresh Farms Ltd.' to the supplier network.",
      time: "5 hours ago",
      icon: Activity,
      color: "var(--color-brand-600)",
      bg: "var(--color-brand-50)",
      read: false
    },
    {
      id: 3,
      type: "ai",
      title: "AI Forecast Update",
      description: "Demand for Avocados is predicted to spike by 25% next week. Suggesting to increase next purchase order.",
      time: "1 day ago",
      icon: Sparkles,
      color: "var(--color-success)",
      bg: "rgba(52, 168, 83, 0.1)",
      read: true
    },
    {
      id: 4,
      type: "info",
      title: "System Update",
      description: "Stash platform was successfully updated to version 2.1.",
      time: "2 days ago",
      icon: Info,
      color: "var(--color-muted)",
      bg: "rgba(100, 116, 139, 0.1)",
      read: true
    }
  ]);

  const markAllAsRead = () => {
    setNotifications(notifications.map(n => ({ ...n, read: true })));
  };

  const markAsRead = (id: number) => {
    setNotifications(notifications.map(n => n.id === id ? { ...n, read: true } : n));
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div className="dashboard-wrapper">
      <div className="owner-dash-header" style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ backgroundColor: 'var(--color-brand-50)', padding: '0.75rem', borderRadius: '50%', color: 'var(--color-brand-600)', display: 'flex' }}>
            <Bell size={24} />
          </div>
          <div>
            <h1 className="dashboard-title" style={{ margin: 0 }}>Notifications</h1>
            <p style={{ margin: '0.25rem 0 0 0', color: 'var(--color-muted)', fontSize: '0.875rem' }}>
              You have {unreadCount} unread alerts
            </p>
          </div>
        </div>
        {unreadCount > 0 && (
          <button 
            onClick={markAllAsRead}
            style={{ 
              backgroundColor: 'transparent', 
              border: '1px solid var(--color-brand-200)', 
              color: 'var(--color-brand-700)',
              padding: '0.5rem 1rem',
              borderRadius: '0.375rem',
              fontSize: '0.875rem',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}
          >
            <CheckCircle size={16} /> Mark all as read
          </button>
        )}
      </div>

      <div className="dashboard-card" style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          {notifications.map((notif, idx) => {
            const Icon = notif.icon;
            return (
              <div 
                key={notif.id} 
                onClick={() => markAsRead(notif.id)}
                style={{ 
                  display: 'flex', 
                  gap: '1rem', 
                  padding: '1.25rem', 
                  borderBottom: idx !== notifications.length - 1 ? '1px solid var(--color-divider)' : 'none',
                  backgroundColor: notif.read ? 'transparent' : 'rgba(107, 66, 38, 0.03)',
                  cursor: 'pointer',
                  transition: 'background-color 0.2s ease'
                }}
              >
                <div style={{ 
                  width: '2.5rem', 
                  height: '2.5rem', 
                  borderRadius: '50%', 
                  backgroundColor: notif.bg, 
                  color: notif.color,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0
                }}>
                  <Icon size={20} />
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.25rem' }}>
                    <h3 style={{ 
                      margin: 0, 
                      fontSize: '1rem', 
                      fontWeight: notif.read ? 500 : 700, 
                      color: 'var(--color-brand-800)' 
                    }}>
                      {notif.title}
                    </h3>
                    <span style={{ fontSize: '0.75rem', color: 'var(--color-muted)', whiteSpace: 'nowrap', marginLeft: '1rem' }}>
                      {notif.time}
                    </span>
                  </div>
                  <p style={{ margin: 0, fontSize: '0.875rem', color: notif.read ? 'var(--color-muted)' : 'var(--color-brand-800)' }}>
                    {notif.description}
                  </p>
                </div>
                {!notif.read && (
                  <div style={{ display: 'flex', alignItems: 'center' }}>
                    <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: 'var(--color-brand-600)' }}></div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
        
        {notifications.length === 0 && (
          <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--color-muted)' }}>
            <Bell size={48} style={{ opacity: 0.2, margin: '0 auto 1rem' }} />
            <p>No new notifications at this time.</p>
          </div>
        )}
      </div>
    </div>
  );
}
