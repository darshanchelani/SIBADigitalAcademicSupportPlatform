import React from 'react';
import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';

function TopNav({ user, onLogout, onToggleSidebar }) {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showNotifications, setShowNotifications] = useState(false);
  const notifRef = useRef(null);

  useEffect(() => {
    if (user?.role === 'Moderator' || user?.role === 'Admin') {
      fetchUnreadCount();
      const interval = setInterval(fetchUnreadCount, 30000); // Poll every 30s
      return () => clearInterval(interval);
    }
  }, [user]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setShowNotifications(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const fetchUnreadCount = async () => {
    try {
      const res = await axios.get('/notifications/unread-count');
      setUnreadCount(res.data.count);
    } catch (err) {
      // silent
    }
  };

  const fetchNotifications = async () => {
    try {
      const res = await axios.get('/notifications');
      setNotifications(res.data);
    } catch (err) {
      // silent
    }
  };

  const toggleNotifications = () => {
    if (!showNotifications) {
      fetchNotifications();
    }
    setShowNotifications(!showNotifications);
  };

  const markAllRead = async () => {
    try {
      await axios.patch('/notifications/mark-all-read');
      setUnreadCount(0);
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    } catch (err) {
      // silent
    }
  };

  const handleNotificationClick = async (notif) => {
    if (!notif.isRead) {
      try {
        await axios.patch(`/notifications/${notif._id}/read`);
        setUnreadCount((prev) => Math.max(0, prev - 1));
        setNotifications((prev) =>
          prev.map((n) => (n._id === notif._id ? { ...n, isRead: true } : n))
        );
      } catch (err) {
        // silent
      }
    }
    if (notif.relatedQuery) {
      navigate(`/dashboard/moderator/queue/${notif.relatedQuery._id || notif.relatedQuery}`);
      setShowNotifications(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/kb?q=${encodeURIComponent(searchQuery)}`);
    }
  };

  return (
    <nav className="bg-white border-b border-surface-200 shadow-sm sticky top-0 z-30">
      <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Hamburger + Logo */}
          <div className="flex items-center space-x-2">
            <button
              onClick={onToggleSidebar}
              className="lg:hidden p-2 text-surface-500 hover:text-surface-700 hover:bg-surface-100 rounded-xl transition-colors"
              aria-label="Toggle sidebar"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
            </button>
            <div
              className="flex items-center space-x-3 cursor-pointer"
              onClick={() => navigate('/dashboard')}
            >
              <div className="w-9 h-9 bg-surface-800 rounded-lg flex items-center justify-center shadow-sm">
                <img
                  src="/sukkur-iba-logo.png"
                  alt="Sukkur IBA University"
                  className="w-7 h-7 object-contain"
                />
              </div>
              <h1 className="text-lg font-bold text-surface-900 hidden sm:block">SDASP</h1>
            </div>
          </div>

          {/* Search Bar */}
          <form
            onSubmit={handleSearch}
            className="flex-1 max-w-lg mx-2 sm:mx-4 lg:mx-8 hidden sm:block"
          >
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search knowledge base..."
                className="w-full px-4 py-2 pl-10 bg-surface-50 text-surface-900 border border-surface-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-400 placeholder:text-surface-400 text-sm transition-all duration-200"
              />
              <svg
                className="absolute left-3 top-2.5 h-5 w-5 text-surface-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </div>
          </form>

          {/* Notifications & Profile */}
          <div className="flex items-center space-x-3">
            {(user?.role === 'Moderator' || user?.role === 'Admin') && (
              <div className="relative" ref={notifRef}>
                <button
                  onClick={toggleNotifications}
                  className="relative p-2 text-surface-500 hover:text-surface-700 hover:bg-surface-100 rounded-xl transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                    />
                  </svg>
                  {unreadCount > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 bg-red-500 text-white text-xs rounded-full w-4.5 h-4.5 flex items-center justify-center text-[10px] font-bold min-w-[18px] h-[18px] animate-bounce-in">
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                  )}
                </button>

                {showNotifications && (
                  <div className="absolute right-0 mt-2 w-80 bg-white rounded-2xl shadow-xl border border-surface-200 z-50 max-h-96 overflow-y-auto animate-fade-in-down">
                    <div className="flex justify-between items-center p-4 border-b border-surface-100">
                      <h3 className="font-semibold text-surface-900 text-sm">Notifications</h3>
                      {unreadCount > 0 && (
                        <button
                          onClick={markAllRead}
                          className="text-xs text-primary-600 hover:text-primary-700 font-medium"
                        >
                          Mark all read
                        </button>
                      )}
                    </div>
                    {notifications.length === 0 ? (
                      <p className="p-6 text-sm text-surface-400 text-center">No notifications</p>
                    ) : (
                      notifications.map((notif) => (
                        <button
                          key={notif._id}
                          onClick={() => handleNotificationClick(notif)}
                          className={`w-full text-left p-3.5 border-b border-surface-50 hover:bg-surface-50 transition-colors ${
                            !notif.isRead ? 'bg-primary-50/50' : ''
                          }`}
                        >
                          <div className="flex items-start space-x-3">
                            {!notif.isRead && (
                              <span className="w-2 h-2 bg-primary-500 rounded-full mt-1.5 flex-shrink-0"></span>
                            )}
                            <div className={!notif.isRead ? '' : 'ml-5'}>
                              <p className="text-sm font-medium text-surface-900">{notif.title}</p>
                              <p className="text-xs text-surface-500 mt-0.5">{notif.message}</p>
                              <p className="text-xs text-surface-400 mt-1">
                                {new Date(notif.createdAt).toLocaleString()}
                              </p>
                            </div>
                          </div>
                        </button>
                      ))
                    )}
                  </div>
                )}
              </div>
            )}

            <button
              onClick={() => navigate('/dashboard/profile')}
              className="flex items-center space-x-2.5 hover:bg-surface-100 rounded-xl px-2 py-1.5 transition-colors"
            >
              {user?.profilePicture ? (
                <img
                  src={user.profilePicture}
                  alt={user?.name}
                  className="w-8 h-8 rounded-lg object-cover ring-2 ring-surface-200"
                />
              ) : (
                <div className="w-8 h-8 bg-gradient-to-br from-primary-400 to-primary-600 rounded-lg flex items-center justify-center">
                  <span className="text-sm font-semibold text-white">
                    {user?.name?.charAt(0).toUpperCase() || 'U'}
                  </span>
                </div>
              )}
              <div className="hidden md:block text-left">
                <p className="text-sm font-medium text-surface-900">{user?.name}</p>
                <p className="text-xs text-surface-400">{user?.role}</p>
              </div>
            </button>

            <button
              onClick={onLogout}
              className="p-2 text-surface-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-colors"
              title="Logout"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}

export default TopNav;
