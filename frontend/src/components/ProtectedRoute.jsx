// src/components/ProtectedRoute.jsx
import React, { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { socket } from '../main';

const ProtectedRoute = ({ children }) => {
    const [status, setStatus] = useState('checking'); // 'checking' | 'ok' | 'fail'
    const [user, setUser] = useState(null);

    useEffect(() => {
        const id = localStorage.getItem('id');
        if (!id) {
            setStatus('fail');
            return;
        }

        // Validación por socket con callback
        socket.emit('validar-usuario', id, (res) => {
            if (res.status === 'ok') {
                setUser(res.user);
                setStatus('ok');
            } else {
                //localStorage.removeItem('id');
                setStatus('fail');
            }
        });
    }, []);

    if (status === 'checking') return <div>Cargando...</div>;
    if (status === 'fail') return <Navigate to="/" replace />;

    // Clonamos el único hijo inyectando `user`
    return React.cloneElement(children, user);
};

export default ProtectedRoute;
