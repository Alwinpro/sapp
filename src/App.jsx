import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import SetupPage from './pages/SetupPage'; // Import SetupPage
import AdminDashboard from './pages/AdminDashboard';
import ManagementDashboard from './pages/ManagementDashboard';
import TeacherDashboard from './pages/TeacherDashboard';
import StudentDashboard from './pages/StudentDashboard';
import NotFound from './pages/NotFound';

// Protected Route Component
const ProtectedRoute = ({ children, allowedRoles }) => {
  const { currentUser, userRole, loading } = useAuth();

  if (loading) return <div className="flex items-center justify-center h-screen text-white">Loading...</div>;

  if (!currentUser) {
    return <Navigate to="/" />;
  }

  if (allowedRoles) {
    if (!userRole || !allowedRoles.includes(userRole)) {
      // If no role (profile missing handled in AuthContext now) or wrong role, redirect
      return <Navigate to="/" replace />;
    }
  }

  return children;
};

function App() {
  return (
    <Router basename={import.meta.env.BASE_URL}>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<LandingPage />} />

          {/* System Setup Route - One Time Use */}
          <Route path="/setup" element={<SetupPage />} />

          {/* Login Routes */}
          <Route path="/login/admin" element={<LoginPage role="admin" />} />
          <Route path="/login/management" element={<LoginPage role="management" />} />
          <Route path="/login/teacher" element={<LoginPage role="teacher" />} />
          <Route path="/login/student" element={<LoginPage role="student" />} />

          {/* Dashboards */}
          <Route
            path="/dashboard/admin/*"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard/management/*"
            element={
              <ProtectedRoute allowedRoles={['management']}>
                <ManagementDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard/teacher/*"
            element={
              <ProtectedRoute allowedRoles={['teacher']}>
                <TeacherDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard/student/*"
            element={
              <ProtectedRoute allowedRoles={['student']}>
                <StudentDashboard />
              </ProtectedRoute>
            }
          />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;
