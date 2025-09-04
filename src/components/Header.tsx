import React from 'react';
import { Bell, Menu, Search } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useApp } from '../context/AppContext';

interface HeaderProps {
  onMenuClick: () => void;
}

const Header: React.FC<HeaderProps> = ({ onMenuClick }) => {
  const { currentUser } = useAuth();
  const { notifications } = useApp();

  const unreadCount = notifications.filter(
    (n) => !n.read && n.userId === currentUser?.id
  ).length;

  return (
    // Header con altura fija y borde inferior
    <header className="sticky top-0 z-30 bg-white border-b border-gray-200">
      <div className="h-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
        <div className="flex items-center">
          <button
            onClick={onMenuClick}
            className="lg:hidden p-2 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100"
            aria-label="Abrir menú"
          >
            <Menu className="h-6 w-6" />
          </button>

          <div className="ml-4 lg:ml-0">
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar empleados, solicitudes..."
                className="pl-10 pr-4 py-2 w-64 md:w-80 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-4">
          {/* Notificaciones */}
          <div className="relative">
            <button className="p-2 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100">
              <Bell className="h-6 w-6" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 h-5 w-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                  {unreadCount}
                </span>
              )}
            </button>
          </div>

          {/* User menu */}
          <div className="flex items-center">
            <div className="h-8 w-8 bg-blue-100 rounded-full flex items-center justify-center">
              <span className="text-blue-600 font-medium text-sm">
                {currentUser?.name?.split(' ').map((n) => n[0]).join('')}
              </span>
            </div>
            <div className="ml-3 hidden md:block">
              <p className="text-sm font-medium text-gray-900">{currentUser?.name}</p>
              <p className="text-xs text-gray-500">{currentUser?.department}</p>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;

