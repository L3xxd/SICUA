import React from 'react';
import { useAuth } from '../context/AuthContext';
import EmployeeDashboard from './dashboards/EmployeeDashboard';
import SupervisorDashboard from './dashboards/SupervisorDashboard';
import HRDashboard from './dashboards/HRDashboard';
import DirectorDashboard from './dashboards/DirectorDashboard';

const Dashboard: React.FC = () => {
  const { currentUser } = useAuth();

  const renderDashboard = () => {
    switch (currentUser?.role) {
      case 'employee':
        return <EmployeeDashboard />;
      case 'supervisor':
        return <SupervisorDashboard />;
      case 'hr':
        return <HRDashboard />;
      case 'director':
        return <DirectorDashboard />;
      default:
        return <div>Dashboard no disponible</div>;
    }
  };

  return (
    <div className="space-y-6">
      {renderDashboard()}
    </div>
  );
};

export default Dashboard;