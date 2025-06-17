import { Link } from 'react-router-dom';

export default function AdminPage() {
    return (
        <>
            <div style={{
                minWidth: '280px',
                maxWidth: '600px',
            }} className='admin-container action-admin'>
                <div className='admin-header' style={{ marginBottom: '0px', width: '100%' }}>
                    <button
                        onClick={() => {
                            // Eliminar token o información de sesión
                            localStorage.removeItem('token'); // o el nombre de tu clave/token
                            // Redirigir al login
                            window.location.href = '/login'; // o la ruta de tu login
                        }}
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
                        <span>Salir</span>
                    </button>

                    <div className='titulo-profesional' style={{ width: '100%', textAlign: 'center' }}>
                        Panel
                    </div>
                </div>

                <Link to="/admin/users" className="action-button withdraw-button">
                    <span className="button-text">👤 Usuarios</span>
                </Link>
                <Link to="/admin/transferencias" className="action-button withdraw-button">
                    <span className="button-text">💸 Transferencias</span>
                </Link>
                <Link to="/admin/retiros" className="action-button withdraw-button">
                    <span className="button-text">💸 Retiros</span>
                </Link>
                <Link to="/admin/cuentas" className="action-button withdraw-button">
                    <span className="button-text">🏦 Cuentas</span>
                </Link>
                <Link to="/admin/caja" className="action-button withdraw-button">
                    <span className="button-text">🏧 Caja</span>
                </Link>
                <Link to="/admin/config" className="action-button withdraw-button">
                    <span className="button-text">⚙️ Configuración</span>
                </Link>
            </div>
        </>
    );
};