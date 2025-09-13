import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Sidebar from './Sidebar';
import Header from './Header';
import Footer from './Footer';

const Layout: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { currentUser } = useAuth();

  if (!currentUser) return null;

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="lg:pl-64">
        <Header onMenuClick={() => setSidebarOpen(true)} />
        {/* Sin padding extra; el header sticky reserva espacio */}
        <main className="pt-0 pb-8 px-4 sm:px-6 lg:px-8 min-h-[calc(100vh-4rem)]">
          <div className="max-w-7xl mx-auto">
            <Outlet />
          </div>
        </main>
        <Footer />
      </div>
    </div>
  );
};

export default Layout;
