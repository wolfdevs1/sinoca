import { useEffect, useState, useContext } from 'react';
import { getAllUsers, getWithdraws } from '../services/auth';
import { AuthContext } from '../context/AuthContext';

export default function AdminPage() {
    const [users, setUsers] = useState([]);
    const [withdraws, setWithdraws] = useState([]);
    const { logout } = useContext(AuthContext);

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                // Asume que axios ya usa el baseURL y el header Authorization con el token
                const { data } = await getAllUsers();
                setUsers(data);

            } catch (err) {
                console.error('Error al obtener usuarios:', err);
            }
        };
        const fetchWithdraws = async () => {
            try {
                // Asume que axios ya usa el baseURL y el header Authorization con el token
                const { data } = await getWithdraws();
                setWithdraws(data);

            } catch (err) {
                console.error('Error al obtener usuarios:', err);
            }
        }
        fetchWithdraws();
        fetchUsers();
    }, []);

    return (
        <div className="admin-container">
            <header>
                <h2>Panel de Administrador</h2>
                <button onClick={logout}>Cerrar sesión</button>
            </header>
            <section>
                <h3>Lista de usuarios</h3>
                <ul>
                    {users?.map(u => (
                        <li key={u._id}>
                            <strong>{u.name}</strong> — {u.phone} ({u.role})
                        </li>
                    ))}
                </ul>
            </section>
            <section>
                <h3>Retiros</h3>
                <ul>
                    {withdraws?.map(u => (
                        <li key={u._id}>
                            <strong>{u.account}</strong> — {u.amount}
                        </li>
                    ))}
                </ul>
            </section>
        </div>
    );
}