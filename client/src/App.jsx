import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Layout from './components/Layout';
import Landing from './pages/Landing';
import Login from './pages/Login';
import Register from './pages/Register';
import AdminLogin from './pages/AdminLogin';
import AdminRegister from './pages/AdminRegister';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import VerifyEmail from './pages/VerifyEmail';
import StudentDashboard from './pages/StudentDashboard';
import ModeratorDashboard from './pages/ModeratorDashboard';
import ModerationQueueDetail from './pages/ModerationQueueDetail';
import AdminDashboard from './pages/AdminDashboard';
import AdminUsers from './pages/AdminUsers';
import AdminQueries from './pages/AdminQueries';
import AdminBadges from './pages/AdminBadges';
import AdminResponses from './pages/AdminResponses';
import QueryForm from './pages/QueryForm';
import KBSearch from './pages/KBSearch';
import ResponseView from './pages/ResponseView';
import Gamification from './pages/Gamification';
import Analytics from './pages/Analytics';
import Profile from './pages/Profile';
import ErrorBoundary from './components/ErrorBoundary';
import QuizManagement from './pages/QuizManagement';
import StudentQuiz from './pages/StudentQuiz';
import UserProfile from './pages/UserProfile';
import { ConfirmProvider } from './components/ConfirmDialog';

// Protected Route Component
const ProtectedRoute = ({ children, allowedRoles = [] }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-700"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

function AppRoutes() {
  const { user } = useAuth();

  return (
    <Routes>
      {/* Landing page - shown to unauthenticated users at root */}
      <Route path="/" element={!user ? <Landing /> : <Navigate to="/dashboard" replace />} />

      {/* Public auth routes */}
      <Route path="/login" element={!user ? <Login /> : <Navigate to="/dashboard" replace />} />
      <Route
        path="/register"
        element={!user ? <Register /> : <Navigate to="/dashboard" replace />}
      />
      <Route
        path="/forgot-password"
        element={!user ? <ForgotPassword /> : <Navigate to="/dashboard" replace />}
      />
      <Route
        path="/reset-password"
        element={!user ? <ResetPassword /> : <Navigate to="/dashboard" replace />}
      />
      <Route path="/verify-email" element={<VerifyEmail />} />
      <Route
        path="/admin/login"
        element={!user ? <AdminLogin /> : <Navigate to="/dashboard" replace />}
      />
      <Route
        path="/admin/register"
        element={!user ? <AdminRegister /> : <Navigate to="/dashboard" replace />}
      />

      {/* Protected routes with layout - using /dashboard as base */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }
      >
        <Route
          index
          element={
            <ProtectedRoute>
              {user?.role === 'Admin' ? (
                <AdminDashboard />
              ) : user?.role === 'Moderator' ? (
                <ModeratorDashboard />
              ) : (
                <StudentDashboard />
              )}
            </ProtectedRoute>
          }
        />
        <Route
          path="query/new"
          element={
            <ProtectedRoute allowedRoles={['User', 'Admin', 'Moderator']}>
              <QueryForm />
            </ProtectedRoute>
          }
        />
        <Route
          path="kb"
          element={
            <ProtectedRoute>
              <KBSearch />
            </ProtectedRoute>
          }
        />
        <Route
          path="query/:id"
          element={
            <ProtectedRoute>
              <ResponseView />
            </ProtectedRoute>
          }
        />
        <Route
          path="profile"
          element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          }
        />
        <Route
          path="user/:id"
          element={
            <ProtectedRoute>
              <UserProfile />
            </ProtectedRoute>
          }
        />
        <Route
          path="gamification"
          element={
            <ProtectedRoute>
              <Gamification />
            </ProtectedRoute>
          }
        />
        <Route
          path="quizzes"
          element={
            <ProtectedRoute allowedRoles={['User']}>
              <StudentQuiz />
            </ProtectedRoute>
          }
        />
        <Route
          path="moderator/quizzes"
          element={
            <ProtectedRoute allowedRoles={['Moderator', 'Admin']}>
              <QuizManagement />
            </ProtectedRoute>
          }
        />
        <Route
          path="moderator/queue"
          element={
            <ProtectedRoute allowedRoles={['Moderator', 'Admin']}>
              <ModeratorDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="moderator/queue/:id"
          element={
            <ProtectedRoute allowedRoles={['Moderator', 'Admin']}>
              <ModerationQueueDetail />
            </ProtectedRoute>
          }
        />
        <Route
          path="admin/analytics"
          element={
            <ProtectedRoute allowedRoles={['Admin']}>
              <Analytics />
            </ProtectedRoute>
          }
        />
        <Route
          path="admin/users"
          element={
            <ProtectedRoute allowedRoles={['Admin']}>
              <AdminUsers />
            </ProtectedRoute>
          }
        />
        <Route
          path="admin/queries"
          element={
            <ProtectedRoute allowedRoles={['Admin']}>
              <AdminQueries />
            </ProtectedRoute>
          }
        />
        <Route
          path="admin/badges"
          element={
            <ProtectedRoute allowedRoles={['Admin']}>
              <AdminBadges />
            </ProtectedRoute>
          }
        />
        <Route
          path="admin/responses"
          element={
            <ProtectedRoute allowedRoles={['Admin']}>
              <AdminResponses />
            </ProtectedRoute>
          }
        />
      </Route>

      {/* Redirect all unmatched routes */}
      <Route path="*" element={<Navigate to={user ? '/dashboard' : '/'} replace />} />
    </Routes>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <ConfirmProvider>
          <AppRoutes />
          <Toaster position="top-right" />
        </ConfirmProvider>
      </AuthProvider>
    </ErrorBoundary>
  );
}

export default App;
