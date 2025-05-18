import { useContext, useState } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { changePassword as changePasswordAPI } from '../services/auth';
import Spinner from '../components/Spinner';

export function Home() {
  const { user, logout } = useContext(AuthContext);
  const [loading, setLoading] = useState(false);

  async function handleChangePassword() {
    try {
      setLoading(true);
      const { data } = await changePasswordAPI({ name: user.name });
      // Axios sólo entra aquí si es 2xx
      alert(data.message); // 'Contraseña cambiada correctamente'
    } catch (err) {
      // Aquí caen los 400 y 500
      const errMsg = err.response?.data?.error;
      alert(errMsg || 'Error interno del servidor');
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
        <button onClick={handleChangePassword} type="button" className="btn" disabled={loading}>{loading ? <Spinner /> : 'Cambiar Contraseña'} </button>
        <button onClick={handleLogout} className="btn">
          Cerrar Sesión
        </button>
      </div>
    </div>
  );
}

export default Home;