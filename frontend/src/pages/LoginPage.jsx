import { useState, useContext, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { AuthContext } from '../context/AuthContext';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { SocketContext } from "../context/SocketContext";
import { getVariablesPublic } from "../services/auth";

function LoginPage() {
  const [name, setName] = useState('');
  const { login } = useContext(AuthContext);
  const socket = useContext(SocketContext);
  const [loading, setLoading] = useState(false);
  const timeoutRef = useRef(null); // referencia para limpiar el timeout
  const [firstBonus, setFirstBonus] = useState(0);

  const handleSubmit = async e => {
    e.preventDefault();
    setLoading(true);

    // Configura el timeout para resetear `loading` en 5 minutos
    timeoutRef.current = setTimeout(() => {
      setLoading(false);
      toast.info("La sesión de validación ha expirado.");
    }, 5 * 60 * 1000); // 5 minutos en milisegundos

    socket.emit('login', name, (res) => {
      if (res.ok) {
        toast.success(res.msg);
      } else {
        toast.error(res.msg);
        setLoading(false); // en caso de error, detiene el loading
        clearTimeout(timeoutRef.current); // limpia el timeout
      }
    });
  };

  useEffect(() => {
    socket.on('verified', async (res) => {
      if (res.ok) {
        try {
          socket.emit("received-verified");
          await login(name);
          clearTimeout(timeoutRef.current); // limpia si todo salió bien
          setLoading(false);
        } catch (err) {
          const errMsg = err.response?.data?.error || err.message;
          toast.error('Error al iniciar sesión: ' + errMsg);
          setLoading(false);
        }
      } else {
        toast.error(res.msg);
        setLoading(false);
      }
    });
    return () => {
      socket.off('verified');
      clearTimeout(timeoutRef.current); // limpiar timeout si el componente se desmonta
    }
  }, [socket, name, login]);

  useEffect(() => {
    const fetchVariables = async () => {
      try {
        const response = await getVariablesPublic();
        setFirstBonus(response.data.firstBonus);
      } catch (error) {
        console.error('Error fetching variables:', error);
      }
    };
    fetchVariables();
  }, []);

  return (
    <>
      <form onSubmit={handleSubmit}>
        <div className="branding">
          <div className="branding-icon">🎲</div>
          <h1 className="titulo-profesional">¡Bienvenido!</h1>
          <div style={{ textAlign: 'center', fontWeight: 'bold' }}>🎁 ¡Bonus {firstBonus}% en tu primera carga!</div>
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
          <button
            type="submit"
            className={`btn ${loading ? "gray" : ""}`}
            disabled={loading}
          >
            {loading ? "Validando..." : "Ingresar"}
          </button>
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