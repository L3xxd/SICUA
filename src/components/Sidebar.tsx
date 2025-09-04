import React from 'react';
import { NavLink } from './NavLink';
import { useAuth } from '../context/AuthContext';
import { 
  Home, 
  Calendar, 
  FileText, 
  Users, 
  BarChart3, 
  Settings, 
  LogOut,
  X,
  CheckSquare,
  Clock
} from 'lucide-react';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
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
    
    if (currentUser?.role === 'supervisor' || currentUser?.role === 'hr' || currentUser?.role === 'director') {
      items = [...items, ...supervisorItems];
    }
    
    if (currentUser?.role === 'hr' || currentUser?.role === 'director') {
      items = [...items, ...hrItems];
    }
    
    if (currentUser?.role === 'director') {
      items = [...items, ...directorItems];
    }

    return items;
  };

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
        className={`fixed top-0 left-0 z-50 w-64 h-full bg-white border-r border-gray-200 transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between h-16 px-4 border-b border-gray-200">
          <div className="flex items-center">
            <div className="h-8 w-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <Users className="h-5 w-5 text-white" />
            </div>
            <h1 className="ml-3 text-lg font-semibold text-gray-900">SGP</h1>
          </div>
          <button
            onClick={onClose}
            className="lg:hidden p-2 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100"
          >
            <X className="h-5 w-5" />
          </button>
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

        {/* Navigation */}
        <nav className="flex-1 px-2 py-4 space-y-1">
          {getNavigationItems().map((item) => (
            <NavLink
              key={item.name}
              href={item.href}
              icon={item.icon}
              name={item.name}
            />
          ))}
        </nav>

        {/* Logout button */}
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
    </>
  );
};

export default Sidebar;