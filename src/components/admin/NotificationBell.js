"use client";
import { useState, useEffect, useRef } from 'react';
import { Bell } from 'lucide-react';
import styles from './NotificationBell.module.css';

export default function NotificationBell({ token }) {
  const [notifications, setNotifications] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef(null);

  const fetchNotifications = async () => {
    try {
      const res = await fetch('/api/notifications', {
        headers: { 'x-auth-token': token }
      });
      const data = await res.json();
      if (data.success) {
        setNotifications(prev => {
          // Check for new notifications to trigger browser push
          if (typeof window !== 'undefined' && 'Notification' in window && window.Notification.permission === 'granted') {
            const newNotifs = data.notifications.filter(n => !prev.find(p => p._id === n._id));
            newNotifs.forEach(n => {
              new window.Notification('The Kitchen: تنبيه جديد', { body: n.message, icon: '/icon.png' });
            });
          }
          return data.notifications;
        });
      }
    } catch (err) {
      console.error('Failed to fetch notifications', err);
    }
  };

  useEffect(() => {
    // Request permission for browser notifications
    if (typeof window !== 'undefined' && 'Notification' in window) {
      if (window.Notification.permission !== 'granted' && window.Notification.permission !== 'denied') {
        window.Notification.requestPermission();
      }
    }

    if (token) {
      fetchNotifications();
      const interval = setInterval(fetchNotifications, 15000); // Poll every 15 seconds
      return () => clearInterval(interval);
    }
  }, [token]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const markAsRead = async (id = null) => {
    try {
      const res = await fetch('/api/notifications', {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'x-auth-token': token 
        },
        body: JSON.stringify({ id })
      });
      if (res.ok) fetchNotifications();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className={styles.bellContainer} ref={dropdownRef}>
      <button className={styles.bellBtn} onClick={() => setShowDropdown(!showDropdown)}>
        <Bell size={24} />
        {notifications.length > 0 && <span className={styles.badge}>{notifications.length}</span>}
      </button>

      {showDropdown && (
        <div className={styles.dropdown}>
          <div className={styles.dropdownHeader}>
            <h4>الإشعارات</h4>
            {notifications.length > 0 && (
              <button className={styles.markAllBtn} onClick={() => markAsRead()}>تحديد الكل كمقروء</button>
            )}
          </div>
          <div className={styles.dropdownList}>
            {notifications.length === 0 ? (
              <div className={styles.emptyMsg}>لا توجد إشعارات جديدة</div>
            ) : (
              notifications.map(n => (
                <div key={n._id} className={styles.notificationItem} onClick={() => markAsRead(n._id)}>
                  <p>{n.message}</p>
                  <small>{new Date(n.createdAt).toLocaleTimeString('ar-EG')}</small>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
