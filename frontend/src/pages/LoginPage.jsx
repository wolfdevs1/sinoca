import { useState, useContext } from "react";
import { Link } from "react-router-dom";
import { AuthContext } from '../context/AuthContext';

function LoginPage() {

  const [name, setName] = useState('');
  const { login } = useContext(AuthContext);

  const handleSubmit = async e => {
    e.preventDefault();
    try {
      await login(name);
    } catch (err) {
      alert('Error al iniciar sesión: ' + err.response?.data?.error || err.message);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <h1>Casino</h1>

      <input value={name} onChange={e => setName(e.target.value)} className="input" type="text" placeholder="Usuario" required />

      <div className="btn-group">
        <Link to="/register" className="btn">Registrarse</Link>
        <button className="btn" type="submit">Ingresar</button>
      </div>

    </form>
  );
}

export default LoginPage;