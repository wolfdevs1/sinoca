import { useContext, useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { changePassword as changePasswordAPI, unlockUser as unlockUserAPI } from '../services/auth';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export function Home() {
  const { user, logout } = useContext(AuthContext);
  const [loadingChangePwd, setLoadingChangePwd] = useState(false);
  const [loadingUnlock, setLoadingUnlock] = useState(false);

  async function handleChangePassword() {
    try {
      setLoadingChangePwd(true);
      const { data } = await changePasswordAPI({ name: user.name });
      toast.success(data.message);
    } catch (err) {
      const errMsg = err.response?.data?.error;
      toast.error(errMsg || 'Error interno del servidor');
    } finally {
      setLoadingChangePwd(false);
    }
  }

  async function handleUnlockUsers() {
    try {
      setLoadingUnlock(true);
      const { data } = await unlockUserAPI({ name: user.name });
      toast.success(data.message);
    } catch (err) {
      const errMsg = err.response?.data?.error;
      toast.error(errMsg || 'Error interno del servidor');
    } finally {
      setLoadingUnlock(false);
    }
  }

  const handleLogout = () => logout();

  useEffect(() => {
    // Evita cargarlo más de una vez
    if (window.fbq) return;

    // Inicializar Meta Pixel
    !(function (f, b, e, v, n, t, s) {
      if (f.fbq) return;
      n = f.fbq = function () {
        n.callMethod ?
          n.callMethod.apply(n, arguments) : n.queue.push(arguments);
      };
      if (!f._fbq) f._fbq = n;
      n.push = n;
      n.loaded = true;
      n.version = '2.0';
      n.queue = [];
      t = b.createElement(e);
      t.async = true;
      t.src = v;
      s = b.getElementsByTagName(e)[0];
      s.parentNode.insertBefore(t, s);
    })(window, document, 'script', 'https://connect.facebook.net/en_US/fbevents.js');

    // ID de tu pixel
    window.fbq('init', '4131976883729228');
    window.fbq('track', 'Lead');
  }, []);

  return (
    <>
      <div className="home-container">
        <div className="welcome-section">
          <h1 className="welcome-title">
            Bienvenido, <span className="user-name">{user.name}</span>
          </h1>
          <div className="password-alert">
            <span className="alert-icon">⚠️</span>
            <p>
              Si es la primera vez que ingresas tu contraseña es <strong>cambiar123</strong>
            </p>
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
            disabled={loadingChangePwd}
          >
            <span className="button-icon">🔑</span>
            <span className="button-text">
              {loadingChangePwd ? "Cambiando..." : 'Cambiar Contraseña'}
            </span>
          </button>

          <button
            className="action-button logout-button"
            onClick={handleUnlockUsers}
            disabled={loadingUnlock}
          >
            <span className="button-icon">🔓</span>
            <span className="button-text">
              {loadingUnlock ? "Desbloqueando..." : 'Desbloquear Usuario'}
            </span>
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