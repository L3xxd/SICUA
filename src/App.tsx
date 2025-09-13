import React from 'react';
import { Route, Routes, Navigate } from 'react-router-dom';
import { Protected } from './features/auth/Protected';
import Layout from './app/layout/Layout';
import RequestForm from './features/requests/RequestForm';
import RequestsList from './features/requests/RequestsList';
import Dashboard from './features/dashboard/Dashboard';
import LoginPage from './features/auth/LoginPage';
import CalendarView from './features/calendar/CalendarView';
import ApprovalsView from './features/approvals/ApprovalsView';
import TeamView from './features/team/TeamView';
import EmployeesManagement from './features/users/EmployeesManagement';
import PoliciesView from './features/policies/PoliciesView';
import ReportsView from './features/reports/ReportsView';
import ExecutiveReports from './features/director/ExecutiveReports';
import AnalyticsView from './features/director/AnalyticsView';
import ProfileView from './features/users/ProfileView';

const App: React.FC = () => {
  return (
    <Routes>
      {/* Ruta pública */}
      <Route path="/login" element={<LoginPage />} />

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
