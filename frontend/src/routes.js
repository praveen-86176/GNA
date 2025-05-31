import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';

// Pages
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import OrdersPage from './pages/OrdersPage';
import PartnersPage from './pages/PartnersPage';
import PartnerDashboard from './pages/PartnerDashboard';
import CurrentOrder from './pages/CurrentOrder';
import OrderHistory from './pages/OrderHistory';
import Profile from './pages/Profile';
import Settings from './pages/Settings';
import Analytics from './pages/Analytics';

// Components
import Layout from './components/common/Layout';

// Simple Loading Component
const SimpleLoading = () => (
  <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center">
    <div className="text-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto mb-4"></div>
      <p className="text-gray-600 dark:text-gray-300">Loading Zomato Ops Pro...</p>
    </div>
  </div>
);

// Protected Route Component
const ProtectedRoute = ({ children, requiredRole = null }) => {
  const { isAuthenticated, loading, role } = useAuth();

  if (loading) {
    return <SimpleLoading />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (requiredRole && role !== requiredRole) {
    const redirectPath = role === 'partner' ? '/partner-dashboard' : '/dashboard';
    return <Navigate to={redirectPath} replace />;
  }

  return children;
};

const AppRoutes = () => {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/login" element={<LoginPage />} />
      
      {/* Protected Routes */}
      <Route 
        path="/" 
        element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="/dashboard" replace />} />
        
        {/* Manager Routes */}
        <Route 
          path="dashboard" 
          element={
            <ProtectedRoute requiredRole="manager">
              <DashboardPage />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="orders" 
          element={
            <ProtectedRoute requiredRole="manager">
              <OrdersPage />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="partners" 
          element={
            <ProtectedRoute requiredRole="manager">
              <PartnersPage />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="analytics" 
          element={
            <ProtectedRoute requiredRole="manager">
              <Analytics />
            </ProtectedRoute>
          } 
        />
        
        {/* Partner Routes */}
        <Route 
          path="partner-dashboard" 
          element={
            <ProtectedRoute requiredRole="partner">
              <PartnerDashboard />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="current-order" 
          element={
            <ProtectedRoute requiredRole="partner">
              <CurrentOrder />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="order-history" 
          element={
            <ProtectedRoute requiredRole="partner">
              <OrderHistory />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="profile" 
          element={
            <ProtectedRoute requiredRole="partner">
              <Profile />
            </ProtectedRoute>
          } 
        />
        
        {/* Shared Routes */}
        <Route 
          path="settings" 
          element={
            <ProtectedRoute>
              <Settings />
            </ProtectedRoute>
          } 
        />
      </Route>

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
};

export default AppRoutes; 