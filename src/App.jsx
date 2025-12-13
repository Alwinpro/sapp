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

// Protected Route Component
const ProtectedRoute = ({ children, allowedRoles }) => {
  const { currentUser, userRole, loading } = useAuth();

  if (loading) return <div className="flex items-center justify-center h-screen text-white">Loading...</div>;

  if (!currentUser) {
    return <Navigate to="/" />;
  }

  if (allowedRoles && !allowedRoles.includes(userRole)) {
    // Redirect to their appropriate dashboard if allowed, or home
    if (userRole === 'admin') return <Navigate to="/dashboard/admin" />;
    if (userRole === 'management') return <Navigate to="/dashboard/management" />;
    if (userRole === 'teacher') return <Navigate to="/dashboard/teacher" />;
    if (userRole === 'student') return <Navigate to="/dashboard/student" />;
    return <Navigate to="/" />;
  }

  return children;
};

function App() {
  return (
    <Router basename="/sapp">
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
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;
