import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, FileText, Calendar, Users, BarChart3, Settings, LogOut, Clock, CheckSquare, X, User as UserIcon } from 'lucide-react';
import { useAuth } from '../providers/AuthContext';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const { currentUser, logout } = useAuth();
  const { pathname } = useLocation();

  const baseItems = [
    { name: 'Dashboard', href: '/dashboard', icon: Home },
    { name: 'Mis Solicitudes', href: '/requests', icon: FileText },
    { name: 'Calendario', href: '/calendar', icon: Calendar },
    { name: 'Datos Personales', href: '/profile', icon: UserIcon },
  ];

  const supervisorItems = [
    { name: 'Aprobar Solicitudes', href: '/approvals', icon: CheckSquare },
    { name: 'Mi Equipo', href: '/team', icon: Users },
  ];

  const hrItems = [
    { name: 'Gestión de Empleados', href: '/employees', icon: Users },
    { name: 'Reportes', href: '/reports', icon: BarChart3 },
    { name: 'Políticas', href: '/policies', icon: Settings },
  ];

  const directorItems = [
    { name: 'Reportes Ejecutivos', href: '/executive-reports', icon: BarChart3 },
    { name: 'Análisis Predictivo', href: '/analytics', icon: Clock },
  ];

  let items = [...baseItems];

  if (currentUser?.role === 'supervisor' || currentUser?.role === 'hr' || currentUser?.role === 'director') {
    items = [...items, ...supervisorItems];
  }

  if (currentUser?.role === 'hr' || currentUser?.role === 'director') {
    items = [...items, ...hrItems];
  }

  if (currentUser?.role === 'director') {
    items = [...items, ...directorItems];
  }

  return (
    <>
      {/* Mobile overlay */}
      <div
        className={`fixed inset-0 z-40 lg:hidden ${isOpen ? 'block' : 'hidden'}`}
        onClick={onClose}
      >
        <div className="fixed inset-0 bg-black bg-opacity-25" />
      </div>

      {/* Sidebar */}
      <div
        className={`fixed top-0 left-0 z-50 w-64 h-full lg:h-screen bg-white dark:bg-[var(--bg-panel)] border-r border-gray-200 dark:border-[var(--border)] transform transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        } flex flex-col`}
      >
        {/* Header */}
        <div className="flex items-center justify-between h-16 px-4 border-b border-gray-200 dark:border-[var(--border)]">
          <div className="flex items-center">
            <div className="h-6 w-6 bg-blue-600 rounded-lg flex items-center justify-center dark:bg-[var(--accent-primary)]">
              <Users className="h-4 w-4 text-white" />
            </div>
            <h1 className="ml-3 text-xl font-semibold text-gray-900 dark:text-[var(--text-primary)]">SICUA</h1>
          </div>
          <button
            onClick={onClose}
            className="lg:hidden p-2 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:hover:bg-[color-mix(in_srgb,var(--hover)_12%,transparent)] dark:text-[var(--text-secondary)] dark:hover:text-[var(--text-primary)]"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* User info */}
        <div className="p-4 border-b border-gray-200 dark:border-[var(--border)]">
          <div className="flex items-center">
            <div className="h-12 w-12 rounded-full flex items-center justify-center bg-blue-100 dark:bg-[color-mix(in_srgb,var(--accent-primary)_20%,transparent)]">
              <span className="text-blue-600 dark:text-[var(--accent-primary)] font-medium">
                {currentUser?.name.split(' ').map(n => n[0]).join('')}
              </span>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-900 dark:text-[var(--text-primary)]">{currentUser?.name}</p>
              <p className="text-xs text-gray-500 dark:text-[var(--text-secondary)]">{currentUser?.position}</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-2 py-4 space-y-1 overflow-y-auto">
          {items.map((item) => (
            <Link
              key={item.name}
              to={item.href}
              className={`flex items-center w-full px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                pathname === item.href
                  ? 'bg-blue-100 dark:bg-[color-mix(in_srgb,var(--accent-primary)_20%,transparent)] text-blue-700 dark:text-[var(--text-primary)] border-r-2 border-blue-600 dark:border-[var(--accent-primary)]'
                  : 'text-gray-700 dark:text-[var(--text-secondary)] hover:bg-gray-100 dark:hover:bg-[#2C2C2C] hover:text-gray-900 dark:hover:text-[var(--hover)]'
              }`}
            >
              <item.icon className={`h-5 w-5 mr-3 ${pathname === item.href ? 'text-blue-600 dark:text-[var(--accent-primary)]' : 'text-gray-400 dark:text-[var(--text-secondary)]'}`} />
              {item.name}
            </Link>
          ))}
        </nav>

        {/* Logout button */}
        <div className="p-4 border-t border-gray-200 dark:border-[var(--border)]">
          <button
            onClick={logout}
            className="flex items-center w-full px-3 py-2 text-sm font-medium text-gray-700 dark:text-[var(--text-secondary)] rounded-md hover:bg-gray-100 dark:hover:bg-[#2C2C2C] hover:text-gray-900 dark:hover:text-[var(--text-primary)] transition-colors"
          >
            <LogOut className="h-5 w-5 mr-3" />
            Cerrar Sesión
          </button>
        </div>
      </div>
    </>
  );
};

export default Sidebar;
