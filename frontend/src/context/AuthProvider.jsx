// src/context/AuthProvider.jsx
import { useState, useEffect } from 'react';
import { jwtDecode } from "jwt-decode";
import { getProfile, login as loginAPI, setToken as setAuthHeader, newAccount as newAccountAPI } from '../services/auth';
import { AuthContext } from './AuthContext';

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (!token) {
            setLoading(false);
            return;
        }

        try {
            const decoded = jwtDecode(token);
            if (Date.now() >= decoded.exp * 1000) {
                throw new Error('Token expirado');
            }
            // Configura el header de autorización para futuras peticiones
            setAuthHeader(token);

            // Obtener perfil de usuario desde el backend
            (async () => {
                try {
                    const { data } = await getProfile();
                    setUser(data);
                } catch (err) {
                    console.error('No se pudo cargar perfil:', err);
                    localStorage.removeItem('token');
                } finally {
                    setLoading(false);
                }
            })();
        } catch (err) {
            console.error('Token inválido o expirado', err);
            localStorage.removeItem('token');
            setLoading(false);
        }
    }, []);

    const login = async (name) => {
        const res = await loginAPI({ name });
        const { token, user: u } = res.data;

        localStorage.setItem('token', token);
        setAuthHeader(token);
        setUser(u);
    };

    const logout = () => {
        setUser(null);
        setAuthHeader(null);
        localStorage.removeItem('token');
    };

    const addAcount = async (account) => {
        const res = await newAccountAPI({ account });
        setUser(res.data.user);
    };

    return (
        <AuthContext.Provider value={{ user, loading, login, logout, addAcount }}>
            {children}
        </AuthContext.Provider>
    );
}
