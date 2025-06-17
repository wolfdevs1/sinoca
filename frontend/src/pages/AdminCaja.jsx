import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAccounts, getSaldos, crearTransferManual, crearWithdrawManual, getResumen } from '../services/auth';

export default function AdminCaja() {
    const [saldos, setSaldos] = useState({ cuenta1: 0 });
    const [resumen, setResumen] = useState({ ingreso: 0, egreso: 0, retiro: 0, aporte: 0 });
    const [formularioActivo, setFormularioActivo] = useState('');
    const [formData, setFormData] = useState({ cuenta: '', importe: '', descripcion: '' });
    const navigate = useNavigate();

    const [cuentas, setCuentas] = useState([]);

    useEffect(() => {
        document.body.style.overflow = formularioActivo ? 'hidden' : 'auto';
    }, [formularioActivo]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [
                    { data: cuentasData },
                    { data: saldosData },
                    { data: resumenData }
                ] = await Promise.all([
                    getAccounts(),
                    getSaldos(),
                    getResumen()
                ]);

                const saldosCompletos = { ...saldosData };

                // Asegura que toda cuenta registrada en Accounts tenga un saldo, aunque sea 0
                cuentasData.forEach(cuenta => {
                    if (!(cuenta.name in saldosCompletos)) {
                        saldosCompletos[cuenta.name] = 0;
                    }
                });

                setSaldos(saldosCompletos);
                setCuentas(cuentasData);
                setResumen(resumenData);
            } catch (error) {
                console.error('Error al cargar datos de caja:', error);
            }
        };
        fetchData();
    }, []);

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

    const procesarTransaccion = async (e, tipo) => {
        e.preventDefault();
        const { cuenta, importe, descripcion } = formData;
        const importeNum = parseFloat(importe);

        if (!cuenta || isNaN(importeNum) || importeNum <= 0) {
            alert('Por favor completa todos los campos correctamente');
            return;
        }

        try {
            if (tipo === 'ingreso') {
                await crearTransferManual({
                    name: descripcion || 'Ingreso manual',
                    amount: importe,
                    account: cuenta
                });
            } else if (tipo === 'egreso') {
                await crearWithdrawManual({
                    name: descripcion || 'Egreso manual',
                    amount: importe,
                    withdrawAccount: cuenta
                });
            } else if (tipo === 'aporte') {
                await crearTransferManual({
                    name: 'Aporte',
                    amount: importe,
                    account: cuenta
                });
            } else if (tipo === 'retiro') {
                await crearWithdrawManual({
                    name: 'Retiro',
                    amount: importe,
                    withdrawAccount: cuenta
                });
            }

            // recargar saldos luego del ingreso o egreso
            const { data: nuevosSaldos } = await getSaldos();
            setSaldos(nuevosSaldos);

            setResumen(prev => ({ ...prev, [tipo]: prev[tipo] + importeNum }));
            setFormData({ cuenta: '', importe: '', descripcion: '' });
            setFormularioActivo('');
        } catch (err) {
            console.error('Error al procesar transacción:', err);
            alert('Ocurrió un error al guardar el movimiento');
        }
    };

    const total = Object.values(saldos).reduce((sum, val) => sum + val, 0);

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
                            {cuentas.map((cuenta) => (
                                <option key={cuenta._id} value={cuenta.name}>
                                    {cuenta.name} - {cuenta.bank}
                                </option>
                            ))}
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
                        {Object.entries(saldos).map(([nombreCuenta, saldo]) => (
                            <div key={nombreCuenta} className="cuenta-item">
                                <h3>{nombreCuenta.toUpperCase()}</h3>
                                <div className="monto">{formatMoney(saldo)}</div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="card">
                    <div className="action-buttons">
                        <button className={`action-button deposit-button ${formularioActivo === 'ingreso' ? 'activo' : ''}`} onClick={() => mostrarFormulario('ingreso')}>Ingreso</button>
                        <button className={`action-button withdraw-button ${formularioActivo === 'egreso' ? 'activo' : ''}`} onClick={() => mostrarFormulario('egreso')}>Egreso</button>
                        <button className={`action-button aporte-button ${formularioActivo === 'aporte' ? 'activo' : ''}`} onClick={() => mostrarFormulario('aporte')}>Aporte</button>
                        <button className={`action-button logout-button ${formularioActivo === 'retiro' ? 'activo' : ''}`} onClick={() => mostrarFormulario('retiro')}>Retiro</button>
                    </div>
                </div>

                <div className="card" style={{ marginTop: '24px' }}>
                    <h3 className="page-title">Resumen Histórico</h3>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '16px' }}>
                        <div className="resumen-item ingresos"><h4>Total Ingresos</h4><div className="valor">{formatMoney(resumen.ingreso)}</div></div>
                        <div className="resumen-item egresos"><h4>Total Egresos</h4><div className="valor">{formatMoney(resumen.egreso)}</div></div>
                        <div className="resumen-item aportes"><h4>Total Aportes</h4><div className="valor">{formatMoney(resumen.aporte)}</div></div>
                        <div className="resumen-item retiros"><h4>Total Retiros</h4><div className="valor">{formatMoney(resumen.retiro)}</div></div>
                    </div>
                </div>
            </div>
        </>
    );

}
