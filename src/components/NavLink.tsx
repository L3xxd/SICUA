import React from 'react';
import { NavLink as RouterNavLink } from 'react-router-dom';
import type { LucideIcon } from 'lucide-react';

interface Props {
  to: string;
  icon: LucideIcon;
  name: string;
  onClick?: () => void; // útil para cerrar el sidebar en móvil
}

export const NavLink: React.FC<Props> = ({ to, icon: Icon, name, onClick }) => {
  return (
    <RouterNavLink
      to={to}
      onClick={onClick}
      className={({ isActive }) =>
        `flex items-center w-full px-3 py-2 text-sm font-medium rounded-md transition-colors ${
          isActive
            ? 'bg-blue-100 text-blue-700 border-r-2 border-blue-600'
            : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
        }`
      }
    >
      {({ isActive }) => (
        <>
          <Icon className={`h-5 w-5 mr-3 ${isActive ? 'text-blue-600' : 'text-gray-400'}`} />
          {name}
        </>
      )}
    </RouterNavLink>
  );
};
