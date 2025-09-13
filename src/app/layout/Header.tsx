import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Bell, Menu, Search, Check, Moon, Sun } from 'lucide-react';
import { useAuth } from '../providers/AuthContext';
import { useApp } from '../providers/AppContext';

interface HeaderProps {
  onMenuClick: () => void;
}

const Header: React.FC<HeaderProps> = ({ onMenuClick }) => {
  const { currentUser } = useAuth();
  const { notifications, markNotificationAsRead, searchQuery, setSearchQuery, theme, toggleTheme } = useApp();

  const [open, setOpen] = useState(false);
  const popoverRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const onClickOutside = (e: MouseEvent) => {
      if (popoverRef.current && !popoverRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', onClickOutside);
    return () => document.removeEventListener('mousedown', onClickOutside);
  }, []);

  const userNotifications = useMemo(() => {
    return notifications
      .filter((n) => n.userId === currentUser?.id)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [notifications, currentUser?.id]);

  const unreadCount = userNotifications.filter((n) => !n.read).length;

  const markAllAsRead = () => {
    userNotifications.forEach((n) => {
      if (!n.read) markNotificationAsRead(n.id);
    });
  };

  return (
    // Header pegado arriba; ocupa su espacio natural
    <header className="sticky top-0 z-30 bg-white dark:bg-[var(--bg-panel)] border-b border-gray-200 dark:border-[var(--border)]">
      <div className="h-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
        <div className="flex items-center">
          <button
            onClick={onMenuClick}
            className="lg:hidden p-2 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:text-[var(--text-secondary)] dark:hover:text-[var(--text-primary)] dark:hover:bg-[#2C2C2C]"
            aria-label="Abrir menú"
          >
            <Menu className="h-6 w-6" />
          </button>
          {currentUser?.role !== 'employee' && (
            <div className="ml-4 lg:ml-0">
              <div className="relative">
                <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Buscar empleados, solicitudes..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 pr-4 py-2 w-64 md:w-80 border border-gray-300 dark:border-[var(--border)] rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-[var(--bg-panel)] dark:text-[var(--text-primary)] placeholder:text-gray-400 dark:placeholder:text-[var(--text-secondary)]"
                />
              </div>
            </div>
          )}
        </div>

        <div className="flex items-center space-x-4">
          {/* Notificaciones */}
          <div className="relative" ref={popoverRef}>
            <button
              className="p-2 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:text-[var(--text-secondary)] dark:hover:text-[var(--text-primary)] dark:hover:bg-[#2C2C2C]"
              onClick={() => setOpen((v) => !v)}
              aria-haspopup="true"
              aria-expanded={open}
              aria-label="Notificaciones"
            >
              <Bell className="h-6 w-6" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 h-5 w-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                  {unreadCount}
                </span>
              )}
            </button>
            {open && (
              <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-[var(--bg-panel)] border border-gray-200 dark:border-[var(--border)] rounded-lg shadow-lg overflow-hidden">
                <div className="flex items-center justify-between px-4 py-2 border-b border-gray-200 dark:border-[var(--border)]">
                  <span className="text-sm font-medium text-gray-700 dark:text-[var(--text-secondary)]">Notificaciones</span>
                  <button
                    className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-700"
                    onClick={markAllAsRead}
                  >
                    <Check className="h-4 w-4" /> Marcar todas como leídas
                  </button>
                </div>
                <div className="max-h-80 overflow-y-auto">
                  {userNotifications.length === 0 ? (
                    <div className="p-4 text-sm text-gray-500 dark:text-[var(--text-secondary)]">Sin notificaciones</div>
                  ) : (
                    userNotifications.map((n) => (
                      <button
                        key={n.id}
                        onClick={() => markNotificationAsRead(n.id)}
                        className={`w-full text-left px-4 py-3 border-b border-gray-100 dark:border-[var(--border)] hover:bg-gray-50 dark:hover:bg-[#2C2C2C] ${
                          n.read ? 'bg-white dark:bg-[var(--bg-panel)]' : 'bg-blue-50 dark:bg-[color-mix(in_srgb,var(--accent-primary)_20%,transparent)]'
                        }`}
                      >
                        <p className="text-sm font-medium text-gray-900 dark:text-[var(--text-primary)]">{n.title}</p>
                        <p className="text-xs text-gray-600 dark:text-[var(--text-secondary)] mt-0.5">{n.message}</p>
                        <p className="text-[11px] text-gray-400 dark:text-[var(--text-secondary)] mt-1">
                          {new Date(n.createdAt).toLocaleString()}
                        </p>
                      </button>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Theme toggle */}
          <button
            onClick={toggleTheme}
            className="p-2 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:text-[var(--text-secondary)] dark:hover:text-[var(--text-primary)] dark:hover:bg-[#2C2C2C]"
            aria-label="Cambiar tema"
            title={theme === 'dark' ? 'Cambiar a claro' : 'Cambiar a oscuro'}
          >
            {theme === 'dark' ? <Sun className="h-6 w-6" /> : <Moon className="h-6 w-6" />}
          </button>

          {/* User menu */}
          <div className="flex items-center">
            <div className="h-8 w-8 rounded-full flex items-center justify-center bg-blue-100 dark:bg-[color-mix(in_srgb,var(--accent-primary)_20%,transparent)]">
              <span className="text-blue-600 dark:text-[var(--accent-primary)] font-medium text-sm">
                {currentUser?.name?.split(' ').map((n) => n[0]).join('')}
              </span>
            </div>
            <div className="ml-3 hidden md:block">
              <p className="text-sm font-medium text-gray-900 dark:text-[var(--text-primary)]">{currentUser?.name}</p>
              <p className="text-xs text-gray-500 dark:text-[var(--text-secondary)]">{currentUser?.department}</p>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
