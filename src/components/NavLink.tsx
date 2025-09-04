import React from 'react';
import { DivideIcon as LucideIcon } from 'lucide-react';

interface NavLinkProps {
  href: string;
  icon: LucideIcon;
  name: string;
  onClick?: () => void;
}

export const NavLink: React.FC<NavLinkProps> = ({ href, icon: Icon, name, onClick }) => {
  const [currentPage, setCurrentPage] = React.useState('dashboard');

  const isActive = currentPage === href;

  const handleClick = () => {
    setCurrentPage(href);
    if (onClick) onClick();
  };

  return (
    <button
      onClick={handleClick}
      className={`flex items-center w-full px-3 py-2 text-sm font-medium rounded-md transition-colors ${
        isActive
          ? 'bg-blue-100 text-blue-700 border-r-2 border-blue-600'
          : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
      }`}
    >
      <Icon className={`h-5 w-5 mr-3 ${isActive ? 'text-blue-600' : 'text-gray-400'}`} />
      {name}
    </button>
  );
};