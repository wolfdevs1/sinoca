import { useEffect, useState, useContext } from 'react';
import { getAllUsers } from '../services/auth';
import { AuthContext } from '../context/AuthContext';

export default function AdminUsers() {
    const [users, setUsers] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const { logout } = useContext(AuthContext);

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const { data } = await getAllUsers();
                setUsers(data);
            } catch (err) {
                console.error('Error al obtener usuarios:', err);
            }
        };

        fetchUsers();
    }, []);

    const filteredUsers = users.filter(user =>
        user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.phone.includes(searchTerm)
    );

    return (
        <div className="admin-container">
            <div className="admin-header">
                <h1 className="admin-title">Usuarios</h1>
                <button className="logout-btn" onClick={logout}>
                    Cerrar Sesión
                </button>
            </div>

            <div className="search-container">
                <input
                    type="text"
                    className="search-input"
                    placeholder="Buscar por nombre o teléfono..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>

            <div className="table-container">
                {filteredUsers.length === 0 ? (
                    <div className="empty-state">
                        <p>No se encontraron usuarios</p>
                    </div>
                ) : (
                    <table className="usuarios-table">
                        <thead>
                            <tr>
                                <th>Nombre</th>
                                <th>Teléfono</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredUsers.map(user => (
                                <tr key={user._id}>
                                    <td>{user.name}</td>
                                    <td>{user.phone.replace('549', '').replace('@c.us', '')}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
}
