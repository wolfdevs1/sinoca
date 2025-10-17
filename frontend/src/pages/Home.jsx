import { useContext, useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import {
  changePassword as changePasswordAPI,
  unlockUser as unlockUserAPI,
  getVariablesPublic, // 👈 traemos las variables (incluye pixel)
} from '../services/auth';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export function Home() {
  const { user, logout } = useContext(AuthContext);
  const [loadingChangePwd, setLoadingChangePwd] = useState(false);
  const [loadingUnlock, setLoadingUnlock] = useState(false);
  const [pixelId, setPixelId] = useState(''); // 👈 estado para el Pixel ID
  const initedPixelRef = useRef(null);        // 👈 evita doble init del mismo pixel

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

  // 1) Traer variables (pixel) del backend
  useEffect(() => {
    const fetchVars = async () => {
      try {
        const res = await getVariablesPublic();
        setPixelId(res.data?.pixel || ''); // guarda el pixel desde variables
      } catch (e) {
        console.error('No se pudo obtener pixel desde variables:', e);
      }
    };
    fetchVars();
  }, []);

  // 2) Inicializar Meta Pixel usando el ID de variables
  useEffect(() => {
    if (!pixelId) return;                 // si no hay pixel configurado, no hacemos nada
    if (initedPixelRef.current === pixelId) {
      // ya se inicializó este mismo pixel: sólo trackeamos evento
      window.fbq?.('track', 'Lead');
      return;
    }

    // Cargar script fbq si no existe
    if (!window.fbq) {
      (function (f, b, e, v, n, t, s) {
        if (f.fbq) return;
        n = f.fbq = function () {
          n.callMethod ? n.callMethod.apply(n, arguments) : n.queue.push(arguments);
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
    }

    // Inicializar con el pixel dinámico y marcar como hecho
    window.fbq('init', pixelId);
    window.fbq('track', 'Lead');
    initedPixelRef.current = pixelId;
  }, [pixelId]);

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
          <Link target="_blank" to="https://birigol.com" className="casino-link">
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
              {loadingChangePwd ? 'Cambiando...' : 'Cambiar Contraseña'}
            </span>
          </button>

          <button
            className="action-button logout-button"
            onClick={handleUnlockUsers}
            disabled={loadingUnlock}
          >
            <span className="button-icon">🔓</span>
            <span className="button-text">
              {loadingUnlock ? 'Desbloqueando...' : 'Desbloquear Usuario'}
            </span>
          </button>
        </div>

        <button className="logout-slim-button" onClick={handleLogout}>
          <span className="logout-slim-text">Cerrar Sesión</span>
        </button>
      </div>
      <ToastContainer />
    </>
  );
}

export default Home;