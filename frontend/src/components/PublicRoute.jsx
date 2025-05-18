import { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

export default function PublicRoute({ children }) {
    const { user, loading } = useContext(AuthContext);

    // Mientras restauramos sesión, muestra algo (o un spinner)
    if (loading) return <div>Cargando...</div>;

    // Si ya hay user, redirige al home
    return user ? <Navigate to="/" replace /> : children;
}