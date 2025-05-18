import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { Navigate } from 'react-router-dom';
import Spinner from './Spinner';

export default function AdminRoute({ children }) {
    const { user, loading } = useContext(AuthContext);

    if (loading) return <Spinner />;

    return user?.role === 'admin' ? children : <Navigate to="/" />;
}