import { useEffect, useState, useContext } from 'react';
import { getAllUsers } from '../services/auth';
import { AuthContext } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom'; // Asegúrate de importar useNavigate

export default function AdminUsers() {
    const [users, setUsers] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate(); // Hook para navegación

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                setLoading(true);
                const { data } = await getAllUsers();
                setUsers(data);
            } catch (err) {
                console.error('Error al obtener usuarios:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchUsers();
    }, []);

    const filteredUsers = users.filter(user =>
        user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.phone.includes(searchTerm)
    );

    const handleGoBack = () => {
        navigate('/admin'); // Ajusta la ruta según tu estructura
    };

    return (
        <div className="admin-container">
            {/* Header con botón de regreso */}
            <div className='admin-header'>
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
                    onMouseEnter={(e) => {
                        e.target.style.background = 'rgba(55, 65, 81, 0.9)';
                        e.target.style.borderColor = 'rgba(156, 163, 175, 0.7)';
                    }}
                    onMouseLeave={(e) => {
                        e.target.style.background = 'rgba(31, 41, 55, 0.8)';
                        e.target.style.borderColor = 'rgba(75, 85, 99, 0.5)';
                    }}
                >
                    <span style={{ fontSize: '16px' }}>←</span>
                    <span>Volver</span>
                </button>
                <div className='titulo-profesional'>Usuarios</div>
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

            {/* Vista de escritorio - Tabla */}
            <div className="desktop-view">
                <div className="table-container">
                    {loading ? (
                        <div className="empty-state">
                            <div style={{ fontSize: '24px', marginBottom: '10px' }}>⏳</div>
                            <p>Cargando usuarios...</p>
                        </div>
                    ) : filteredUsers.length === 0 ? (
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
                                {filteredUsers.map((user, index) => (
                                    <tr key={user._id} style={{
                                        backgroundColor: index % 2 === 0 ? 'rgba(31, 41, 55, 0.3)' : 'rgba(17, 24, 39, 0.3)',
                                        transition: 'all 0.2s ease'
                                    }}>
                                        <td>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                                <span style={{ 
                                                    fontSize: '15px', 
                                                    fontWeight: '500',
                                                    color: '#f3f4f6'
                                                }}>
                                                    {user.name}
                                                </span>
                                            </div>
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

            {/* Vista móvil - Cards */}
            <div className="mobile-view">
                {loading ? (
                    <div className="empty-state">
                        <div style={{ fontSize: '24px', marginBottom: '10px' }}>⏳</div>
                        <p>Cargando usuarios...</p>
                    </div>
                ) : filteredUsers.length === 0 ? (
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
                    <div className="cards-container">
                        {filteredUsers.map((user, index) => (
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
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}