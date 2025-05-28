import { Routes, Route, useLocation } from 'react-router-dom';
import React from 'react';

import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import Home from './pages/Home';
import AdminPage from './pages/AdminPage';

import ProtectedRoute from './components/ProtectedRoute';
import AdminRoute from './components/AdminRoute';
import PublicRoute from './components/PublicRoute';
import DepositPage from './pages/DepositPage';
import WithdrawPage from './pages/WithdrawPage';
import WhatsAppButton from './components/SupportButton';

function App() {
  const location = useLocation();

  return (
    <React.Fragment>
      {!location.pathname.startsWith('/admin') && <WhatsAppButton />}
      <Routes>
        <Route
          path="/login"
          element={
            <PublicRoute>
              <LoginPage />
            </PublicRoute>
          }
        />
        <Route
          path="/register"
          element={
            <PublicRoute>
              <RegisterPage />
            </PublicRoute>
          }
        />
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <Home />
            </ProtectedRoute>
          }
        />
        <Route
          path="/deposit"
          element={
            <ProtectedRoute>
              <DepositPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/withdraw"
          element={
            <ProtectedRoute>
              <WithdrawPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin"
          element={
            <AdminRoute>
              <AdminPage />
            </AdminRoute>
          }
        />
      </Routes>
    </React.Fragment>
  );
}

export default App;