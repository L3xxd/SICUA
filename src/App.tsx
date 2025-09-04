import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';

import Layout from './components/Layout';
import LoginForm from './components/LoginForm';
import Dashboard from './components/Dashboard';
import RequestsList from './components/RequestsList';
import CalendarView from './components/CalendarView';
import ApprovalsView from './components/ApprovalsView';
import ReportsView from './components/ReportsView';

const Protected: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { currentUser } = useAuth();
  return currentUser ? <>{children}</> : <Navigate to="/login" replace />;
};

// Evita que un usuario autenticado entre a /login
const GuestOnly: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { currentUser } = useAuth();
  return currentUser ? <Navigate to="/dashboard" replace /> : <>{children}</>;
};

// Decide adónde mandar cuando visitas "/"
const IndexRedirect: React.FC = () => {
  const { currentUser } = useAuth();
  return <Navigate to={currentUser ? '/dashboard' : '/login'} replace />;
};

export default function App() {
  return (
    <Routes>
      {/* Index -> login o dashboard según sesión */}
      <Route path="/" element={<IndexRedirect />} />

      {/* Login solo si NO estás autenticado */}
      <Route
        path="/login"
        element={
          <GuestOnly>
            <LoginForm />
          </GuestOnly>
        }
      />

      {/* Rutas protegidas (cada una dentro de Layout) */}
      <Route
        path="/dashboard"
        element={
          <Protected>
            <Layout>
              <Dashboard />
            </Layout>
          </Protected>
        }
      />
      <Route
        path="/requests"
        element={
          <Protected>
            <Layout>
              <RequestsList />
            </Layout>
          </Protected>
        }
      />
      <Route
        path="/calendar"
        element={
          <Protected>
            <Layout>
              <CalendarView />
            </Layout>
          </Protected>
        }
      />

      {/* Extras opcionales */}
      <Route
        path="/approvals"
        element={
          <Protected>
            <Layout>
              <ApprovalsView />
            </Layout>
          </Protected>
        }
      />
      <Route
        path="/reports"
        element={
          <Protected>
            <Layout>
              <ReportsView />
            </Layout>
          </Protected>
        }
      />

      {/* Catch-all */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
