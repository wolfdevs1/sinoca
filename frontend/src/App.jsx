import { Routes, Route } from 'react-router-dom';

import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import Home from './pages/Home';
import AdminPage from './pages/AdminPage';

import ProtectedRoute from './components/ProtectedRoute';
import AdminRoute from './components/AdminRoute';
import PublicRoute from './components/PublicRoute';
import DepositPage from './pages/DepositPage';
import WithdrawPage from './pages/WithdrawPage';

function App() {
  return (
    <Routes>
      {/* Si ya está logueado, /login va a "/" */}
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

      {/* Rutas protegidas */}
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
  );
};

export default App;
