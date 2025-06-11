import { Link } from 'react-router-dom';

export default function AdminPage() {
    return (
        <>
            <div style={{
                minWidth: '280px',
                maxWidth: '600px',
            }} className='admin-container action-admin'>
                <div className='admin-header' style={{ marginBottom: '0px', width: '100%' }}>
                    <div className='titulo-profesional' style={{ width: '100%', textAlign: 'center' }}>
                        Panel
                    </div>
                </div>

                <Link to="/admin/users" className="action-button withdraw-button">
                    <span className="button-text">👤 Usuarios</span>
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