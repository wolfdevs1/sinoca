import { useContext, useState } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { changePassword as changePasswordAPI } from '../services/auth';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export function Home() {
  const { user, logout } = useContext(AuthContext);
  const [loading, setLoading] = useState(false);

  async function handleChangePassword() {
    try {
      setLoading(true);
      const { data } = await changePasswordAPI({ name: user.name });
      toast.success(data.message); // 'Contraseña cambiada correctamente'
    } catch (err) {
      const errMsg = err.response?.data?.error;
      toast.error(errMsg || 'Error interno del servidor');
    } finally {
      setLoading(false);
    }
  }

  const handleLogout = () => {
    logout();
  };

  const handleUnlockUsers = () => {
    // Implementar la lógica para desbloquear usuarios
    toast.info("Función de desbloqueo de usuarios");
  };

  return (
    <>
      <div className="home-container">
        <div className="welcome-section">
          <h1 className="welcome-title">Bienvenido, <span className="user-name">{user.name}</span></h1>
          <div className="password-alert">
            <span className="alert-icon">⚠️</span>
            <p>Si es la primera vez que ingresas tu contraseña es <strong>cambiar123</strong></p>
          </div>
        </div>

        <div className="casino-link-container">
          <Link target='_blank' to="https://birigol.com" className="casino-link">
            <span className="casino-icon">🎰</span>
            <span className="casino-text">Link al casino ¡CLICK AQUI!</span>
            <span className="shine-effect"></span>
          </Link>
        </div>

        <div className="action-buttons">
          <Link to="/deposit" className="action-button deposit-button">
            <span className="button-icon">💰</span>
            <span className="button-text">Cargar Saldo</span>
          </Link>

          <Link to="/withdraw" className="action-button withdraw-button">
            <span className="button-icon">💸</span>
            <span className="button-text">Retirar Fondos</span>
          </Link>

          <button
            className="action-button password-button"
            onClick={handleChangePassword}
            disabled={loading}
          >
            <span className="button-icon">🔑</span>
            <span className="button-text">
              {loading ? "Cambiando..." : 'Cambiar Contraseña'}
            </span>
          </button>

          <button
            className="action-button logout-button"
            onClick={handleUnlockUsers}
          >
            <span className="button-icon">🔓</span>
            <span className="button-text">Desbloquear Usuarios</span>
          </button>
        </div>
        
        {/* Botón de cerrar sesión más delgado */}
        <button
          className="logout-slim-button"
          onClick={handleLogout}
        >
          <span className="logout-slim-text">Cerrar Sesión</span>
        </button>
      </div>
      <ToastContainer />
    </>
  );
}

export default Home;