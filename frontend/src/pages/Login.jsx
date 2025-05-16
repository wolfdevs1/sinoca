import { useEffect, useState } from "react";
import { socket } from "../main";
import { Link } from "react-router-dom";

function Login() {

  const [usuario, setUsuario] = useState('');

  // Obtener el ID de Mongo del localStorage
  const id = localStorage.getItem('id');

  // Función para manejar el login
  const login = (e) => {
    e.preventDefault();
    // Emitir evento de creación de usuario
    socket.emit('login', usuario, (res) => {
      if (res.status === 'ok') {
        // Guardar el ID de Mongo en el localStorage
        localStorage.setItem('id', res.id);
        window.location.href = '/panel';
      }
    });
  };

  // Función para manejar el cambio en el input
  const changeHandler = (e) => {
    setUsuario(e.target.value);
  };

  useEffect(() => {
    // Validación por socket con callback
    socket.emit('validar-usuario', id, (res) => {
      if (res.status === 'ok') {
        // Si el usuario ya está logueado, redirigir al panel
        window.location.href = '/panel';
      } else {
        //localStorage.removeItem('id');
      }
    });
  }, []);

  return (
    <form>
      <h1>Casino</h1>

      <input value={usuario} onChange={changeHandler} className="input" type="text" placeholder="Usuario" required />

      <div className="btn-group">
        <Link to="/registro" className="btn">Registrarse</Link>
        <button onClick={login} className="btn" type="submit">Ingresar</button>
      </div>

    </form>
  );
}

export default Login;