import { useNavigate } from 'react-router-dom';

export default function AdminVariables() {
    const navigate = useNavigate(); // ✅ ahora sí, adentro del componente

    const handleGoBack = () => {
        navigate('/admin');
    };

    return (
        <div className="admin-container">
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
                <div className='titulo-profesional'>Variables</div>
            </div>

            <div className="card">
                <div className="input-row">
                    <label className="input-label">BONUS INICIAL:</label>
                    <input type="number" className="input" />
                </div>

                <div className="input-row">
                    <label className="input-label">BONUS EXTRA:</label>
                    <input type="number" className="input" />
                </div>
                <div className="input-row">
                    <label className="input-label">NOMBRE CASINO:</label>
                    <input type="text" className="input" />
                </div>
                <div className="input-row">
                    <label className="input-label">NUMERO SOPORTE:</label>
                    <input type="text" className="input" />
                </div>
            </div>
        </div>
    );
}