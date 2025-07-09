import { Routes, Route, useLocation, Navigate } from 'react-router-dom';
import React, { Suspense, lazy } from 'react';
import ProtectedRoute from './components/ProtectedRoute';
import AdminRoute from './components/AdminRoute';
import PublicRoute from './components/PublicRoute';
import WhatsAppButton from './components/SupportButton';
import 'react-toastify/dist/ReactToastify.css';

// Lazy Load
const LoginPage = lazy(() => import('./pages/LoginPage'));
const RegisterPage = lazy(() => import('./pages/RegisterPage'));
const Home = lazy(() => import('./pages/Home'));
const AdminPage = lazy(() => import('./pages/AdminPage'));
const AdminWithdraw = lazy(() => import('./pages/AdminWithdraws'));
const AdminAccounts = lazy(() => import('./pages/AdminAccounts'));
const AdminUsers = lazy(() => import('./pages/AdminUsers'));
const AdminCaja = lazy(() => import('./pages/AdminCaja'));
const AdminConfig = lazy(() => import('./pages/AdminConfig'));
const AdminTransfers = lazy(() => import('./pages/AdminTransfers'));
const AdminVariables = lazy(() => import('./pages/AdminVariables'));
const DepositPage = lazy(() => import('./pages/DepositPage'));
const WithdrawPage = lazy(() => import('./pages/WithdrawPage'));
const AdminHistorialCaja = lazy(() => import('./pages/AdminHistorialCaja'));

function App() {
  const location = useLocation();

  return (
    <React.Fragment>
      {!location.pathname.startsWith('/admin') && <WhatsAppButton />}

      <Suspense fallback={<div style={{ textAlign: 'center', padding: '20px' }}>Cargando...</div>}>
        <Routes>
          <Route path="/login" element={<PublicRoute><LoginPage /></PublicRoute>} />
          <Route path="/register" element={<PublicRoute><RegisterPage /></PublicRoute>} />
          <Route path="/" element={<ProtectedRoute><Home /></ProtectedRoute>} />
          <Route path="/deposit" element={<ProtectedRoute><DepositPage /></ProtectedRoute>} />
          <Route path="/withdraw" element={<ProtectedRoute><WithdrawPage /></ProtectedRoute>} />
          <Route path="/admin" element={<AdminRoute><AdminPage /></AdminRoute>} />
          <Route path="/admin/transferencias" element={<AdminRoute><AdminTransfers /></AdminRoute>} />
          <Route path="/admin/retiros" element={<AdminRoute><AdminWithdraw /></AdminRoute>} />
          <Route path="/admin/cuentas" element={<AdminRoute><AdminAccounts /></AdminRoute>} />
          <Route path="/admin/users" element={<AdminRoute><AdminUsers /></AdminRoute>} />
          <Route path="/admin/caja" element={<AdminRoute><AdminCaja /></AdminRoute>} />
          <Route path="/admin/variables" element={<AdminRoute><AdminVariables /></AdminRoute>} />
          <Route path="/admin/config" element={<AdminConfig />} />
          <Route path="/admin/historial-caja" element={<AdminRoute><AdminHistorialCaja /></AdminRoute>} />
          <Route path="*" element={<Navigate to="/register" />} />
        </Routes>
      </Suspense>
    </React.Fragment>
  );
}

export default App;
