import { useState } from 'react';

export default function SistemaCaja() {
    const [saldos, setSaldos] = useState({
        cuenta1: 0,
        cuenta2: 0,
        cuenta3: 0
    });

    const [resumen, setResumen] = useState({
        ingreso: 0,
        egreso: 0,
        retiro: 0
    });

    const [formularioActivo, setFormularioActivo] = useState('');
    const [formData, setFormData] = useState({
        cuenta: '',
        importe: '',
        descripcion: ''
    });

    const handleGoBack = () => {
        // Aquí puedes agregar la lógica de navegación que necesites
        console.log('Volver al admin');
    };

    const mostrarFormulario = (tipo) => {
        setFormularioActivo(tipo);
        setFormData({ cuenta: '', importe: '', descripcion: '' });
    };

    const handleInputChange = (field, value) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const procesarTransaccion = (e, tipo) => {
        e.preventDefault();
        
        const { cuenta, importe } = formData;
        const importeNum = parseFloat(importe);
        
        if (!cuenta || isNaN(importeNum) || importeNum <= 0) {
            alert('Por favor completa todos los campos correctamente');
            return;
        }

        // Actualizar saldos
        setSaldos(prev => {
            const newSaldos = { ...prev };
            if (tipo === 'ingreso') {
                newSaldos[cuenta] += importeNum;
            } else {
                newSaldos[cuenta] -= importeNum;
            }
            return newSaldos;
        });

        // Actualizar resumen
        setResumen(prev => ({
            ...prev,
            [tipo]: prev[tipo] + importeNum
        }));

        // Limpiar formulario
        setFormData({ cuenta: '', importe: '', descripcion: '' });
        setFormularioActivo('');
    };

    const total = saldos.cuenta1 + saldos.cuenta2 + saldos.cuenta3;

    const formatMoney = (amount) => {
        return new Intl.NumberFormat('es-AR', {
            style: 'currency',
            currency: 'ARS'
        }).format(amount);
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
                <div className='titulo-profesional'>Sistema de Caja</div>
            </div>

            {/* Resumen de Cuentas */}
            <div className="card" style={{ marginBottom: '24px' }}>
                <div style={{ 
                    display: 'grid', 
                    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
                    gap: '16px' 
                }}>
                    <div className="cuenta-item">
                        <h3>CUENTA 1</h3>
                        <div className="monto">{formatMoney(saldos.cuenta1)}</div>
                    </div>
                    <div className="cuenta-item">
                        <h3>CUENTA 2</h3>
                        <div className="monto">{formatMoney(saldos.cuenta2)}</div>
                    </div>
                    <div className="cuenta-item">
                        <h3>CUENTA 3</h3>
                        <div className="monto">{formatMoney(saldos.cuenta3)}</div>
                    </div>
                    <div className="cuenta-total">
                        <h3>TOTAL</h3>
                        <div className="monto-total">{formatMoney(total)}</div>
                    </div>
                </div>
            </div>

            {/* Botones de Acción */}
            <div className="card" style={{ marginBottom: '24px' }}>
                <div style={{ 
                    display: 'grid', 
                    gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', 
                    gap: '16px',
                    marginBottom: formularioActivo ? '24px' : '0'
                }}>
                    <button 
                        className={`caja-btn btn-ingreso ${formularioActivo === 'ingreso' ? 'activo' : ''}`}
                        onClick={() => mostrarFormulario('ingreso')}
                    >
                        INGRESO
                    </button>
                    <button 
                        className={`caja-btn btn-egreso ${formularioActivo === 'egreso' ? 'activo' : ''}`}
                        onClick={() => mostrarFormulario('egreso')}
                    >
                        EGRESO
                    </button>
                    <button 
                        className={`caja-btn btn-retiro ${formularioActivo === 'retiro' ? 'activo' : ''}`}
                        onClick={() => mostrarFormulario('retiro')}
                    >
                        RETIRO
                    </button>
                </div>

                {/* Formulario Dinámico */}
                {formularioActivo && (
                    <div className="formulario-activo">
                        <h3>Registrar {formularioActivo.charAt(0).toUpperCase() + formularioActivo.slice(1)}</h3>
                        <div>
                            <div className="form-group">
                                <label>Cuenta</label>
                                <select 
                                    className="form-control"
                                    value={formData.cuenta}
                                    onChange={(e) => handleInputChange('cuenta', e.target.value)}
                                >
                                    <option value="">Seleccionar cuenta</option>
                                    <option value="cuenta1">CUENTA 1</option>
                                    <option value="cuenta2">CUENTA 2</option>
                                    <option value="cuenta3">CUENTA 3</option>
                                </select>
                            </div>
                            <div className="form-group">
                                <label>Importe</label>
                                <input 
                                    type="number" 
                                    className="form-control"
                                    step="0.01" 
                                    min="0"
                                    value={formData.importe}
                                    onChange={(e) => handleInputChange('importe', e.target.value)}
                                />
                            </div>
                            <div className="form-group">
                                <label>Descripción</label>
                                <textarea 
                                    className="form-control"
                                    rows={3}
                                    value={formData.descripcion}
                                    onChange={(e) => handleInputChange('descripcion', e.target.value)}
                                />
                            </div>
                            <button 
                                className="btn-submit"
                                onClick={(e) => procesarTransaccion(e, formularioActivo)}
                            >
                                Registrar {formularioActivo.charAt(0).toUpperCase() + formularioActivo.slice(1)}
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* Resumen Histórico */}
            <div className="card">
                <h3 style={{ marginBottom: '20px', color: '#1f2937' }}>Resumen Histórico</h3>
                <div style={{ 
                    display: 'grid', 
                    gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', 
                    gap: '16px' 
                }}>
                    <div className="resumen-item ingresos">
                        <h4>Total Ingresos</h4>
                        <div className="valor">{formatMoney(resumen.ingreso)}</div>
                    </div>
                    <div className="resumen-item egresos">
                        <h4>Total Egresos</h4>
                        <div className="valor">{formatMoney(resumen.egreso)}</div>
                    </div>
                    <div className="resumen-item retiros">
                        <h4>Total Retiros</h4>
                        <div className="valor">{formatMoney(resumen.retiro)}</div>
                    </div>
                </div>
            </div>

            <style jsx>{`
                .card {
                    background: white;
                    border-radius: 12px;
                    padding: 24px;
                    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.05);
                }

                .cuenta-item {
                    background: #f9fafb;
                    padding: 16px;
                    border-radius: 8px;
                    border-left: 4px solid #3b82f6;
                }

                .cuenta-item h3 {
                    font-size: 0.875rem;
                    color: #6b7280;
                    margin-bottom: 8px;
                    font-weight: 500;
                }

                .cuenta-item .monto {
                    font-size: 1.5rem;
                    font-weight: 600;
                    color: #111827;
                }

                .cuenta-total {
                    background: #1e3a8a;
                    color: white;
                    text-align: center;
                    padding: 20px;
                    border-radius: 8px;
                }

                .cuenta-total h3 {
                    color: #e0e7ff;
                    font-size: 0.875rem;
                    margin-bottom: 8px;
                    font-weight: 500;
                }

                .cuenta-total .monto-total {
                    font-size: 2rem;
                    font-weight: 600;
                }

                .caja-btn {
                    padding: 16px 24px;
                    border: none;
                    border-radius: 8px;
                    font-size: 1rem;
                    font-weight: 600;
                    cursor: pointer;
                    color: white;
                    transition: all 0.2s ease-in-out;
                }

                .btn-ingreso {
                    background-color: #2e7d32;
                }

                .btn-egreso {
                    background-color: #ef6c00;
                }

                .btn-retiro {
                    background-color: #c62828;
                }

                .caja-btn:hover {
                    opacity: 0.9;
                    transform: translateY(-1px);
                    box-shadow: 0 6px 20px rgba(0, 0, 0, 0.08);
                }

                .caja-btn.activo {
                    outline: 2px solid #d1d5db;
                    outline-offset: 2px;
                }

                .formulario-activo {
                    border-top: 1px solid #e5e7eb;
                    padding-top: 24px;
                }

                .formulario-activo h3 {
                    font-size: 1.5rem;
                    margin-bottom: 24px;
                    color: #1f2937;
                }

                .form-group {
                    margin-bottom: 20px;
                }

                .form-group label {
                    display: block;
                    margin-bottom: 8px;
                    font-weight: 600;
                    color: #374151;
                    font-size: 0.875rem;
                }

                .form-control {
                    width: 100%;
                    padding: 12px 16px;
                    border: 1px solid #d1d5db;
                    border-radius: 6px;
                    font-size: 1rem;
                    background: white;
                    outline: none;
                }

                .form-control:focus {
                    border-color: #3b82f6;
                    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
                }

                .btn-submit {
                    background-color: #1d4ed8;
                    color: white;
                    padding: 14px 28px;
                    border: none;
                    border-radius: 6px;
                    font-weight: 600;
                    cursor: pointer;
                    font-size: 1rem;
                    width: 100%;
                    transition: background-color 0.2s ease;
                }

                .btn-submit:hover {
                    background-color: #1e40af;
                }

                .resumen-item {
                    background: #e5e7eb;
                    padding: 16px;
                    border-radius: 8px;
                    text-align: center;
                }

                .resumen-item h4 {
                    font-size: 0.875rem;
                    color: #6b7280;
                    margin-bottom: 8px;
                    font-weight: 500;
                }

                .resumen-item .valor {
                    font-size: 1.25rem;
                    font-weight: 600;
                    color: #1e293b;
                }

                .resumen-item.ingresos .valor {
                    color: #2e7d32;
                }

                .resumen-item.egresos .valor {
                    color: #ef6c00;
                }

                .resumen-item.retiros .valor {
                    color: #c62828;
                }

                @media (max-width: 768px) {
                    .card > div[style*="grid-template-columns"] {
                        grid-template-columns: 1fr !important;
                    }
                }
            `}</style>
        </div>
    );
}