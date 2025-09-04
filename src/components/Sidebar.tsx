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
  Clock,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();

  const getNavigationItems = () => {
    const baseItems = [
      { name: 'Dashboard', to: '/dashboard', icon: Home },
      { name: 'Mis Solicitudes', to: '/requests', icon: FileText },
      { name: 'Calendario', to: '/calendar', icon: Calendar },
    ];

    const supervisorItems = [
      { name: 'Aprobar Solicitudes', to: '/approvals', icon: CheckSquare },
      { name: 'Mi Equipo', to: '/team', icon: Users }, // crea esta ruta más adelante o quita este ítem
    ];

    const hrItems = [
      { name: 'Gestión de Empleados', to: '/employees', icon: Users },
      { name: 'Reportes', to: '/reports', icon: BarChart3 },
      { name: 'Políticas', to: '/policies', icon: Settings },
    ];

    const directorItems = [
      { name: 'Reportes Ejecutivos', to: '/executive-reports', icon: BarChart3 },
      { name: 'Análisis Predictivo', to: '/analytics', icon: Clock },
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

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  return (
    <>
      {/* Overlay móvil */}
      <div
        className={`fixed inset-0 z-40 lg:hidden ${isOpen ? 'block' : 'hidden'}`}
        onClick={onClose}
      >
        <div className="fixed inset-0 bg-black bg-opacity-25" />
      </div>

      {/* Sidebar único (móvil + desktop) */}
      <aside
        className={`fixed top-0 left-0 z-50 w-64 h-full bg-white border-r border-gray-200 transform transition-transform duration-300 ease-in-out
              flex flex-col
              ${isOpen ? 'translate-x-0' : '-translate-x-full'}
              lg:translate-x-0`}
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

        {/* Navegación */}
        <nav className="flex-1 px-2 py-4 space-y-1">
          {getNavigationItems().map((item) => (
            <NavLink
              key={item.name}
              to={item.to}
              icon={item.icon}
              name={item.name}
              onClick={onClose} // en móvil cierra el sidebar al navegar
            />
          ))}
        </nav>

        {/* Logout pegado abajo */}
        <div className="p-4 border-t border-gray-200 mt-auto">
          <button
            onClick={handleLogout}
            className="flex items-center w-full px-3 py-2 text-sm font-medium text-gray-700 rounded-md hover:bg-gray-100 hover:text-gray-900 transition-colors"
          >
            <LogOut className="h-5 w-5 mr-3" />
            Cerrar Sesión
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
