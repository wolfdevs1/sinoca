import { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import Spinner from './Spinner';

export default function ProtectedRoute({ children }) {
    const { user, loading } = useContext(AuthContext);

    // Mientras cargo la sesión, puedo mostrar un spinner o nada
    if (loading) return <Spinner />;

    // Una vez cargado, si no hay user, voy a /login
    return user ? children : <Navigate to="/login" />;
}