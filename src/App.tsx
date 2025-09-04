import React from 'react';
import { Route, Routes, Navigate } from 'react-router-dom';
import { Protected } from './components/Protected/Protected';
import Layout from './components/Layout';
import RequestForm from './components/requests/RequestForm';
import RequestsList from './components/requests/RequestsList';
import Dashboard from './components/Dashboard';
import LoginForm from './components/LoginForm';
import CalendarView from './components/CalendarView';
import ApprovalsView from './components/ApprovalsView';
import TeamView from './components/TeamView';

const App: React.FC = () => {
  return (
    <Routes>
      {/* Ruta pública */}
      <Route path="/login" element={<LoginForm />} />

      {/* Rutas protegidas */}
      <Route element={<Protected />}>
        {/* Layout con Sidebar y Header */}
        <Route path="/" element={<Layout />}>
          {/* Redirección desde raíz al dashboard */}
          <Route index element={<Navigate to="/dashboard" replace />} />
          {/* Rutas principales */}
          <Route path="dashboard" element={<Dashboard />} />

          {/* Solicitudes */}
          <Route path="requests" element={<RequestsList />} />
          <Route path="requests/new" element={<RequestForm />} />

          {/* Otras rutas del sidebar */}
          <Route path="calendar" element={<CalendarView />} />
          <Route path="approvals" element={<ApprovalsView />} />
          <Route path="team" element={<TeamView />} />
          <Route path="reports" element={<div>Reportes</div>} />
          <Route path="employees" element={<div>Gestión de empleados</div>} />
        </Route>
      </Route>

      {/* Fallback */}
      <Route path="*" element={<div>404 - Página no encontrada</div>} />
    </Routes>
  );
};

export default App;
