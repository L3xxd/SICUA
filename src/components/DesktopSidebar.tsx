// src/components/DesktopSidebar.tsx
import React from 'react';
import { NavLink } from './NavLink';
import { useAuth } from '../context/AuthContext';
import {
  Home, Calendar, FileText, Users, BarChart3, Settings, LogOut, CheckSquare, Clock,
} from 'lucide-react';

const DesktopSidebar: React.FC = () => {
  const { currentUser, logout } = useAuth();

  const getNavigationItems = () => {
    const baseItems = [
      { name: 'Dashboard', href: 'dashboard', icon: Home },
      { name: 'Mis Solicitudes', href: 'requests', icon: FileText },
      { name: 'Calendario', href: 'calendar', icon: Calendar },
    ];
    const supervisorItems = [
      { name: 'Aprobar Solicitudes', href: 'approvals', icon: CheckSquare },
      { name: 'Mi Equipo', href: 'team', icon: Users },
    ];
    const hrItems = [
      { name: 'Gestión de Empleados', href: 'employees', icon: Users },
      { name: 'Reportes', href: 'reports', icon: BarChart3 },
      { name: 'Políticas', href: 'policies', icon: Settings },
    ];
    const directorItems = [
      { name: 'Reportes Ejecutivos', href: 'executive-reports', icon: BarChart3 },
      { name: 'Análisis Predictivo', href: 'analytics', icon: Clock },
    ];

    let items = [...baseItems];
    if (['supervisor', 'hr', 'director'].includes(currentUser?.role ?? '')) items = [...items, ...supervisorItems];
    if (['hr', 'director'].includes(currentUser?.role ?? '')) items = [...items, ...hrItems];
    if (currentUser?.role === 'director') items = [...items, ...directorItems];
    return items;
  };

  return (
    <aside className="hidden lg:flex w-64 shrink-0 h-dvh sticky top-0 bg-white border-r border-gray-200">
      <div className="w-64 h-dvh flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between h-16 px-4 border-b border-gray-200">
          <div className="flex items-center">
            <div className="h-8 w-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <Users className="h-5 w-5 text-white" />
            </div>
            <h1 className="ml-3 text-lg font-semibold text-gray-900">SGP</h1>
          </div>
        </div>

        {/* User info */}
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center">
            <div className="h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center">
              <span className="text-blue-600 font-medium">
                {currentUser?.name.split(' ').map(n => n[0]).join('')}
              </span>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-900">{currentUser?.name}</p>
              <p className="text-xs text-gray-500">{currentUser?.position}</p>
            </div>
          </div>
        </div>

        {/* Navegación */}
        <nav className="flex-1 px-2 py-4 space-y-1 overflow-y-auto">
          {getNavigationItems().map(item => (
            <NavLink key={item.name} href={item.href} icon={item.icon} name={item.name} />
          ))}
        </nav>

        {/* Logout */}
        <div className="p-4 border-t border-gray-200">
          <button
            onClick={logout}
            className="flex items-center w-full px-3 py-2 text-sm font-medium text-gray-700 rounded-md hover:bg-gray-100 hover:text-gray-900 transition-colors"
          >
            <LogOut className="h-5 w-5 mr-3" />
            Cerrar Sesión
          </button>
        </div>
      </div>
    </aside>
  );
};

export default DesktopSidebar;
