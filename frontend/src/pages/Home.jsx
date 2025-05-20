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

  return (
    <div>
      <h1>Bienvenido, {user.name}!</h1>
      <div className="alerta">
        Si es la primera vez que ingresas tu contraseña es cambiar123
      </div>
      <div className="btn-group btn-group-panel">
        <Link to="/deposit" className="btn">Cargar</Link>
        <Link to="/withdraw" className="btn">Retirar</Link>
        <button onClick={handleChangePassword} type="button" className="btn" disabled={loading}>
          {loading ? "Cambiando..." : 'Cambiar Contraseña'}
        </button>
        <button onClick={handleLogout} className="btn">
          Cerrar Sesión
        </button>
      </div>
      <ToastContainer />
    </div>
  );
}

export default Home;