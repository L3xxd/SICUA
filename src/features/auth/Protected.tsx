import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../app/providers/AuthContext';

export const Protected: React.FC = () => {
  const { currentUser } = useAuth();

  // Si no hay usuario, redirigir a login
  if (!currentUser) {
    return <Navigate to="/login" replace />;
  }

  // Renderiza las rutas hijas protegidas
  return <Outlet />;
};
