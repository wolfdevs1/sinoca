// src/pages/Panel.jsx
import { Link } from "react-router-dom";

const Panel = ({ usuario }) => {

  const clearLocalStorage = () => {
    localStorage.removeItem('id');
    window.location.href = '/';
  };

  return (
    <div>
      <h1>Bienvenido, {usuario}</h1>
      <div className="alerta">
        Si es la primera vez que ingresas tu contraseña es cambiar123
      </div>
      <div className="btn-group btn-group-panel">
        <Link to="/carga" className="btn">Cargar</Link>
        <Link to="/retiro" className="btn">Retirar</Link>
        <button type="button" className="btn">Cambiar Contraseña</button>
        <button onClick={clearLocalStorage} className="btn">Cerrar Sesión</button>
      </div>
    </div>
  );
};

export default Panel;
