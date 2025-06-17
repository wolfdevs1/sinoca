import { Routes, Route, useLocation } from 'react-router-dom';
import React from 'react';

import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import Home from './pages/Home';
import AdminPage from './pages/AdminPage';
import AdminWithdraw from './pages/AdminWithdraws';
import AdminAccounts from './pages/AdminAccounts';
import AdminUsers from './pages/AdminUsers';
import AdminCaja from './pages/AdminCaja'
import AdminConfig from './pages/AdminConfig'
import AdminTransfers from './pages/AdminTransfers'

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
        <Route
          path="/admin/transferencias"
          element={
            <AdminRoute>
              <AdminTransfers />
            </AdminRoute>
          }
        />
        <Route
          path="/admin/retiros"
          element={
            <AdminRoute>
              <AdminWithdraw />
            </AdminRoute>
          }
        />
        <Route
          path="/admin/cuentas"
          element={
            <AdminRoute>
              <AdminAccounts />
            </AdminRoute>
          }
        />
        <Route
          path="/admin/users"
          element={
            <AdminRoute>
              <AdminUsers />
            </AdminRoute>
          }
        />
        <Route
          path="/admin/caja"
          element={
            <AdminRoute>
              <AdminCaja />
            </AdminRoute>
          }
        />
        <Route
          path="/admin/config"
          element={
            <AdminConfig />
          }
        />

      </Routes>
    </React.Fragment>
  );
}

export default App;