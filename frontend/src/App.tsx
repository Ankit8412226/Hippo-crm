import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import { Layout } from './components/layout/Layout';

import { LandingPage } from './pages/LandingPage';
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

const ADMIN_ROLES = ['ADMIN', 'DIRECTOR'];

const ProtectedRoute: React.FC<{ children: React.ReactNode; adminOnly?: boolean }> = ({
  children,
  adminOnly
}) => {
  const { token, user } = useAuth();
  if (!token) {
    return <Navigate to="/login" replace />;
  }
  const isAdmin = !!user && ADMIN_ROLES.includes(user.role);
  // Admin-only page requested by an agent -> bounce to their landing page.
  if (adminOnly && !isAdmin) {
    return <Navigate to="/mlm-tree" replace />;
  }
  return <Layout>{children}</Layout>;
};

// Sends the user to the right home depending on their role.
const HomeRedirect: React.FC = () => {
  const { token, user } = useAuth();
  if (!token) {
    return <Navigate to="/" replace />;
  }
  const isAdmin = !!user && ADMIN_ROLES.includes(user.role);
  return <Navigate to={isAdmin ? '/dashboard' : '/mlm-tree'} replace />;
};

export const App: React.FC = () => {
  return (
    <AuthProvider>
      <ToastProvider>
        <Router>
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<LoginPage />} />

            <Route path="/dashboard" element={<ProtectedRoute adminOnly><DashboardPage /></ProtectedRoute>} />
            <Route path="/employees" element={<ProtectedRoute><EmployeesPage /></ProtectedRoute>} />
            <Route path="/mlm-tree" element={<ProtectedRoute><MLMTreePage /></ProtectedRoute>} />
            <Route path="/projects" element={<ProtectedRoute adminOnly><ProjectsPage /></ProtectedRoute>} />
            <Route path="/plots" element={<ProtectedRoute><PlotManagementPage /></ProtectedRoute>} />
            <Route path="/plot-maps" element={<ProtectedRoute adminOnly><PlotMapsPage /></ProtectedRoute>} />
            <Route path="/commissions" element={<ProtectedRoute><CommissionsPage /></ProtectedRoute>} />
            <Route path="/payouts" element={<ProtectedRoute><PayoutsPage /></ProtectedRoute>} />
            <Route path="/ocr-analyzer" element={<ProtectedRoute adminOnly><OCRAnalyzerPage /></ProtectedRoute>} />
            <Route path="/reports" element={<ProtectedRoute adminOnly><ReportsPage /></ProtectedRoute>} />
            <Route path="/notifications" element={<ProtectedRoute><NotificationsPage /></ProtectedRoute>} />
            <Route path="/settings" element={<ProtectedRoute adminOnly><SettingsPage /></ProtectedRoute>} />

            <Route path="*" element={<HomeRedirect />} />
          </Routes>
        </Router>
      </ToastProvider>
    </AuthProvider>
  );
};

export default App;

