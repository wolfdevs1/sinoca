import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export default function SistemaCaja() {
    const [saldos, setSaldos] = useState({ cuenta1: 0, cuenta2: 0, cuenta3: 0 });
    const [resumen, setResumen] = useState({ ingreso: 0, egreso: 0, retiro: 0 });
    const [formularioActivo, setFormularioActivo] = useState('');
    const [formData, setFormData] = useState({ cuenta: '', importe: '', descripcion: '' });
    const navigate = useNavigate();

    useEffect(() => {
        document.body.style.overflow = formularioActivo ? 'hidden' : 'auto';
    }, [formularioActivo]);

    const handleGoBack = () => {
        navigate('/admin'); // Ajusta si tu ruta de admin es diferente
    };

    

const mostrarFormulario = (tipo) => {
    setFormularioActivo(prev => prev === tipo ? '' : tipo);
    setFormData({ cuenta: '', importe: '', descripcion: '' });
};

    const handleInputChange = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const procesarTransaccion = (e, tipo) => {
        e.preventDefault();
        const { cuenta, importe } = formData;
        const importeNum = parseFloat(importe);

        if (!cuenta || isNaN(importeNum) || importeNum <= 0) {
            alert('Por favor completa todos los campos correctamente');
            return;
        }

        setSaldos(prev => {
            const newSaldos = { ...prev };
            tipo === 'ingreso' ? newSaldos[cuenta] += importeNum : newSaldos[cuenta] -= importeNum;
            return newSaldos;
        });

        setResumen(prev => ({ ...prev, [tipo]: prev[tipo] + importeNum }));
        setFormData({ cuenta: '', importe: '', descripcion: '' });
        setFormularioActivo('');
    };

    const total = saldos.cuenta1 + saldos.cuenta2 + saldos.cuenta3;

    const formatMoney = (amount) => new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS' }).format(amount);

    return (
        <>{formularioActivo && (
    <div className="modal-overlay active" onClick={() => setFormularioActivo('')}>
        <form
            className="modal-formulario"
            onClick={(e) => e.stopPropagation()} // evita que se cierre al hacer clic dentro
            onSubmit={(e) => procesarTransaccion(e, formularioActivo)}
        >
            <button
                type="button"
                onClick={() => setFormularioActivo('')}
                style={{
                    position: 'absolute',
                    top: '10px',
                    right: '12px',
                    background: 'transparent',
                    border: 'none',
                    fontSize: '20px',
                    cursor: 'pointer',
                    color: '#999'
                }}
            >
                ×
            </button>

            <h3 className="page-title">Registrar {formularioActivo.charAt(0).toUpperCase() + formularioActivo.slice(1)}</h3>
            <div className="form-group">
                <label>Cuenta</label>
                <select className="input" value={formData.cuenta} onChange={(e) => handleInputChange('cuenta', e.target.value)}>
                    <option value="">Seleccionar cuenta</option>
                    <option value="cuenta1">CUENTA 1</option>
                    <option value="cuenta2">CUENTA 2</option>
                    <option value="cuenta3">CUENTA 3</option>
                </select>
            </div>
            <div className="form-group">
                <label>Importe</label>
                <input type="number" className="input" step="0.01" min="0" value={formData.importe} onChange={(e) => handleInputChange('importe', e.target.value)} />
            </div>
            <div className="form-group">
                <label>Descripción</label>
                <textarea className="input" rows={3} value={formData.descripcion} onChange={(e) => handleInputChange('descripcion', e.target.value)} />
            </div>
            <button className="btn" type="submit">Registrar</button>
        </form>
    </div>
)}
        
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
                <div className='titulo-profesional'>Caja</div>
            </div>

            <div className="card">
                <div>
                    <div className="cuenta-item"><h3>CUENTA 1</h3><div className="monto">{formatMoney(saldos.cuenta1)}</div></div>
                    <div className="cuenta-item"><h3>CUENTA 2</h3><div className="monto">{formatMoney(saldos.cuenta2)}</div></div>
                    <div className="cuenta-item"><h3>CUENTA 3</h3><div className="monto">{formatMoney(saldos.cuenta3)}</div></div>
                    <div className="cuenta-total"><h3>TOTAL</h3><div className="monto-total">{formatMoney(total)}</div></div>
                </div>
            </div>

            <div className="card">
                <div className="action-buttons">
                    <button className={`action-button deposit-button ${formularioActivo === 'ingreso' ? 'activo' : ''}`} onClick={() => mostrarFormulario('ingreso')}>Ingreso</button>
                    <button className={`action-button withdraw-button ${formularioActivo === 'egreso' ? 'activo' : ''}`} onClick={() => mostrarFormulario('egreso')}>Egreso</button>
                    <button className={`action-button logout-button ${formularioActivo === 'retiro' ? 'activo' : ''}`} onClick={() => mostrarFormulario('retiro')}>Retiro</button>
                </div>



            </div>

            <div className="card" style={{ marginTop: '24px' }}>
                <h3 className="page-title">Resumen Histórico</h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '16px' }}>
                    <div className="resumen-item ingresos"><h4>Total Ingresos</h4><div className="valor">{formatMoney(resumen.ingreso)}</div></div>
                    <div className="resumen-item egresos"><h4>Total Egresos</h4><div className="valor">{formatMoney(resumen.egreso)}</div></div>
                    <div className="resumen-item retiros"><h4>Total Retiros</h4><div className="valor">{formatMoney(resumen.retiro)}</div></div>
                </div>
            </div>
        </div>
        </>
    );

}
