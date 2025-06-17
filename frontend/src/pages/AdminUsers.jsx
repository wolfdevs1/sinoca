import { useEffect, useState } from 'react';
import { getAllUsers } from '../services/auth';
import { useNavigate } from 'react-router-dom';

export default function AdminUsers() {
    const [users, setUsers] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [page, setPage] = useState(1);
    const [pages, setPages] = useState(1);
    const limit = 5;

    const navigate = useNavigate();

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const { data } = await getAllUsers(page, limit, searchTerm);
                setUsers(data.users);
                setPages(data.pages);
            } catch (err) {
                console.error('Error al obtener usuarios:', err);
            }
        };

        fetchUsers();
    }, [page, searchTerm]);

    const handleGoBack = () => {
        navigate('/admin');
    };

    return (
        <div className="admin-container">
            {/* Header */}
            <div className="admin-header">
                <button
                    onClick={handleGoBack}
                    style={{
                        background: 'rgba(31, 41, 55, 0.8)',
                        border: '1px solid rgba(75, 85, 99, 0.5)',
                        borderRadius: '8px',
                        padding: '8px 12px',
                        color: '#e5e7eb',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        fontSize: '14px',
                        fontWeight: '500',
                        transition: 'all 0.2s ease'
                    }}
                >
                    <span style={{ fontSize: '16px' }}>←</span>
                    <span>Volver</span>
                </button>
                <div className="titulo-profesional">Usuarios</div>
            </div>

            {/* Búsqueda */}
            <div className="admin-controls">
                <div className="search-container">
                    <div className="input-icon-group">
                        <input
                            type="text"
                            className="input search-input"
                            placeholder="Buscar..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                        <span className="input-icon">🔍</span>
                    </div>
                </div>
            </div>

            {/* Vista escritorio */}
            <div className="desktop-view">
                <div className="table-container" style={{ minHeight: '180px' }}>
                    {users.length === 0 ? (
                        <div className="empty-state">
                            <div style={{ fontSize: '48px', marginBottom: '15px', opacity: '0.5' }}>👤</div>
                            <p>{searchTerm ? 'No se encontraron usuarios' : 'No hay usuarios registrados'}</p>
                            {searchTerm && (
                                <button
                                    className="btn"
                                    onClick={() => setSearchTerm('')}
                                    style={{
                                        marginTop: '15px',
                                        maxWidth: '200px',
                                        background: 'linear-gradient(135deg, #6b7280, #4b5563)'
                                    }}
                                >
                                    Limpiar búsqueda
                                </button>
                            )}
                        </div>
                    ) : (
                        <table className="retiros-table" style={{ backgroundColor: 'rgba(17, 24, 39, 0.6)' }}>
                            <thead>
                                <tr>
                                    <th style={{ borderRadius: '8px 0 0 0' }}>Usuario</th>
                                    <th style={{ borderRadius: '0 8px 0 0' }}>Teléfono</th>
                                </tr>
                            </thead>
                            <tbody>
                                {users.map((user, index) => (
                                    <tr key={user._id} style={{
                                        backgroundColor: index % 2 === 0 ? 'rgba(31, 41, 55, 0.3)' : 'rgba(17, 24, 39, 0.3)',
                                        transition: 'all 0.2s ease'
                                    }}>
                                        <td>
                                            <span style={{
                                                fontWeight: '500',
                                                color: '#f3f4f6'
                                            }}>
                                                {user.name}
                                            </span>
                                        </td>
                                        <td>
                                            <span style={{
                                                fontFamily: 'monospace',
                                                backgroundColor: 'rgba(31, 41, 55, 0.6)',
                                                padding: '6px 10px',
                                                borderRadius: '6px',
                                                fontSize: '15px',
                                                color: '#e5e7eb',
                                                fontWeight: '500'
                                            }}>
                                                {user.phone.replace('549', '').replace('@c.us', '')}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>

            {/* Vista móvil */}
            <div className="mobile-view">
                <div className="cards-container" style={{ minHeight: '180px' }}>
                    {users.length === 0 ? (
                        <div className="empty-state">
                            <div style={{ fontSize: '48px', marginBottom: '15px', opacity: '0.5' }}>👤</div>
                            <p>{searchTerm ? 'No se encontraron usuarios' : 'No hay usuarios registrados'}</p>
                            {searchTerm && (
                                <button
                                    className="btn"
                                    onClick={() => setSearchTerm('')}
                                    style={{
                                        marginTop: '15px',
                                        background: 'linear-gradient(135deg, #6b7280, #4b5563)'
                                    }}
                                >
                                    Limpiar búsqueda
                                </button>
                            )}
                        </div>
                    ) : (
                        users.map((user) => (
                            <div key={user._id} className="withdraw-card" style={{
                                background: 'rgba(17, 24, 39, 0.8)',
                                borderLeft: '4px solid #3b82f6'
                            }}>
                                <div className="card-header">
                                    <div className="user-info" style={{ display: 'flex', alignItems: 'center', gap: '15px', width: '100%' }}>
                                        <div style={{
                                            width: '44px',
                                            height: '44px',
                                            borderRadius: '50%',
                                            background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            color: 'white',
                                            fontSize: '17px',
                                            fontWeight: 'bold',
                                            flexShrink: 0
                                        }}>
                                            {user.name.charAt(0).toUpperCase()}
                                        </div>
                                        <div style={{ flex: 1 }}>
                                            <h3 style={{
                                                fontSize: '18px',
                                                fontWeight: '500',
                                                color: '#f3f4f6',
                                                margin: '0 0 8px 0'
                                            }}>
                                                {user.name}
                                            </h3>
                                            <div style={{
                                                backgroundColor: 'rgba(31, 41, 55, 0.8)',
                                                padding: '6px 12px',
                                                borderRadius: '6px',
                                                display: 'inline-flex',
                                                alignItems: 'center',
                                                gap: '6px'
                                            }}>
                                                <span style={{ fontSize: '14px' }}>📱</span>
                                                <span style={{
                                                    fontFamily: 'monospace',
                                                    fontSize: '15px',
                                                    color: '#e5e7eb',
                                                    fontWeight: '500'
                                                }}>
                                                    {user.phone.replace('549', '').replace('@c.us', '')}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>

            {/* Paginación */}
            <div className="pagination">
                <button disabled={page <= 1} onClick={() => setPage(page - 1)}>←</button>
                <span>{page} / {pages}</span>
                <button disabled={page >= pages} onClick={() => setPage(page + 1)}>→</button>
            </div>
        </div>
    );
}
