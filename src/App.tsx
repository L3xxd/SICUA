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
import EmployeesManagement from './components/EmployeesManagement';
import PoliciesView from './components/PoliciesView';
import ReportsView from './components/ReportsView';
import ExecutiveReports from './components/director/ExecutiveReports';
import AnalyticsView from './components/director/AnalyticsView';
import ProfileView from './components/ProfileView';

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
          <Route path="profile" element={<ProfileView />} />

          {/* Solicitudes */}
          <Route path="requests" element={<RequestsList />} />
          <Route path="requests/new" element={<RequestForm />} />

          {/* Otras rutas del sidebar */}
          <Route path="calendar" element={<CalendarView />} />
          <Route path="approvals" element={<ApprovalsView />} />
          <Route path="team" element={<TeamView />} />
          <Route path="reports" element={<ReportsView />} />
          <Route path="employees" element={<EmployeesManagement />} />
          <Route path="policies" element={<PoliciesView />} />
          <Route path="executive-reports" element={<ExecutiveReports />} />
          <Route path="analytics" element={<AnalyticsView />} />
        </Route>
      </Route>

      {/* Fallback */}
      <Route path="*" element={<div>404 - Página no encontrada</div>} />
    </Routes>
  );
};

export default App;
