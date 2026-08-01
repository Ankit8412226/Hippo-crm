import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Layout } from './components/layout/Layout';

import { LoginPage } from './pages/LoginPage';
import { DashboardPage } from './pages/DashboardPage';
import { EmployeesPage } from './pages/EmployeesPage';
import { MLMTreePage } from './pages/MLMTreePage';
import { ProjectsPage } from './pages/ProjectsPage';
import { PlotManagementPage } from './pages/PlotManagementPage';
import { PlotMapsPage } from './pages/PlotMapsPage';
import { CommissionsPage } from './pages/CommissionsPage';
import { PayoutsPage } from './pages/PayoutsPage';
import { OCRAnalyzerPage } from './pages/OCRAnalyzerPage';
import { ReportsPage } from './pages/ReportsPage';
import { NotificationsPage } from './pages/NotificationsPage';
import { SettingsPage } from './pages/SettingsPage';

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { token } = useAuth();
  if (!token) {
    return <Navigate to="/login" replace />;
  }
  return <Layout>{children}</Layout>;
};

export const App: React.FC = () => {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<LoginPage />} />

          <Route path="/dashboard" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
          <Route path="/employees" element={<ProtectedRoute><EmployeesPage /></ProtectedRoute>} />
          <Route path="/mlm-tree" element={<ProtectedRoute><MLMTreePage /></ProtectedRoute>} />
          <Route path="/projects" element={<ProtectedRoute><ProjectsPage /></ProtectedRoute>} />
          <Route path="/plots" element={<ProtectedRoute><PlotManagementPage /></ProtectedRoute>} />
          <Route path="/plot-maps" element={<ProtectedRoute><PlotMapsPage /></ProtectedRoute>} />
          <Route path="/commissions" element={<ProtectedRoute><CommissionsPage /></ProtectedRoute>} />
          <Route path="/payouts" element={<ProtectedRoute><PayoutsPage /></ProtectedRoute>} />
          <Route path="/ocr-analyzer" element={<ProtectedRoute><OCRAnalyzerPage /></ProtectedRoute>} />
          <Route path="/reports" element={<ProtectedRoute><ReportsPage /></ProtectedRoute>} />
          <Route path="/notifications" element={<ProtectedRoute><NotificationsPage /></ProtectedRoute>} />
          <Route path="/settings" element={<ProtectedRoute><SettingsPage /></ProtectedRoute>} />

          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
};

export default App;
