import { useState, useContext } from "react";
import { Link } from "react-router-dom";
import { AuthContext } from '../context/AuthContext';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function LoginPage() {
  const [name, setName] = useState('');
  const { login } = useContext(AuthContext);

  const handleSubmit = async e => {
    e.preventDefault();
    try {
      await login(name);
    } catch (err) {
      const errMsg = err.response?.data?.error || err.message;
      toast.error('Error al iniciar sesión: ' + errMsg);
    }
  };

  return (
    <>
      <form onSubmit={handleSubmit}>
        <div className="branding">
          <div className="branding-icon">🎲</div>
          <h1 className="titulo-profesional">¡Bienvenido!</h1>
          <p className="subtitulo-profesional">Casino Joyita</p>
        </div>

        <input
          value={name}
          onChange={e => setName(e.target.value)}
          className="input"
          type="text"
          placeholder="Usuario"
          required
        />

        <div className="btn-group">
          <button className="btn" type="submit">Ingresar</button>
          <div className="link-group">
            <span>¿No tienes una cuenta? </span>
            <Link to="/register">Registrarse</Link>
          </div>
        </div>
      </form>

      <ToastContainer />
    </>
  );
}

export default LoginPage;