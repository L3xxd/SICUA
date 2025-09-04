// src/components/Layout.tsx
import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import Sidebar from './Sidebar';              // móvil (overlay)
import DesktopSidebar from './DesktopSidebar'; // ✅ nombre correcto
import Header from './Header';

interface LayoutProps { children: React.ReactNode; }

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { currentUser } = useAuth();
  if (!currentUser) return null;

  return (
    <div className="min-h-dvh bg-gray-50 flex">
      <DesktopSidebar /> {/* escritorio */}
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} /> {/* móvil */}

      <div className="flex-1 flex flex-col">
        <header className="sticky top-0 z-20 bg-white border-b">
          <Header onMenuClick={() => setSidebarOpen(true)} />
        </header>
        <main className="flex-1 px-4 sm:px-6 lg:px-8 py-6">
          <div className="max-w-7xl mx-auto">{children}</div>
        </main>
      </div>
    </div>
  );
};

export default Layout;
