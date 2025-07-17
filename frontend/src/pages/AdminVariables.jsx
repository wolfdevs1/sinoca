import { useNavigate } from 'react-router-dom';
import { getVariables, updateVariables } from '../services/auth'; // Asegúrate de que la ruta sea correcta
import { useEffect, useState } from 'react';

export default function AdminVariables() {
    const [firstBonus, setFirstBonus] = useState(0);
    const [specialBonus, setSpecialBonus] = useState(0);
    const [casinoName, setCasinoName] = useState('');
    const [supportNumber, setSupportNumber] = useState('');
    const [isSaving, setIsSaving] = useState(false);
    const [panelUser, setPanelUser] = useState('');
    const [panelPassword, setPanelPassword] = useState('');
    const [nombrePagina, setNombrePagina] = useState('');

    const navigate = useNavigate();

    const handleGoBack = () => {
        navigate('/admin');
    };

    useEffect(() => {
        const fetchVariables = async () => {
            try {
                const response = await getVariables();
                setFirstBonus(response.data.firstBonus);
                setSpecialBonus(response.data.specialBonus);
                setCasinoName(response.data.casinoName);
                setSupportNumber(response.data.supportNumber);
                setPanelUser(response.data.panelUser);
                setPanelPassword(response.data.panelPassword);
                setNombrePagina(response.data.nombrePagina);
            } catch (error) {
                console.error('Error fetching variables:', error);
            }
        };
        fetchVariables();
    }, []);

    const handleSave = async () => {
        setIsSaving(true);
        const payload = {
            firstBonus,
            specialBonus,
            casinoName,
            supportNumber,
            panelUser,
            panelPassword,
            nombrePagina
        };

        try {
            const response = await updateVariables(payload);
            console.log('Variables updated:', response.data);
            // opcional: mostrar toast o mensaje al usuario
        } catch (error) {
            console.error('Error updating variables:', error);
            // opcional: mostrar feedback de error
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="admin-container">
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
                        transition: 'all 0.2s ease',
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
                <div className="titulo-profesional">Variables</div>
            </div>

            <div className="card">
                <div className="input-row">
                    <label className="input-label">BONUS INICIAL:</label>
                    <input
                        type="number"
                        className="input"
                        value={firstBonus}
                        onChange={(e) => setFirstBonus(Number(e.target.value))}
                    />
                </div>

                <div className="input-row">
                    <label className="input-label">BONUS EXTRA:</label>
                    <input
                        type="number"
                        className="input"
                        value={specialBonus}
                        onChange={(e) => setSpecialBonus(Number(e.target.value))}
                    />
                </div>

                <div className="input-row">
                    <label className="input-label">NOMBRE CASINO:</label>
                    <input
                        type="text"
                        className="input"
                        value={casinoName}
                        onChange={(e) => setCasinoName(e.target.value)}
                    />
                </div>

                <div className="input-row">
                    <label className="input-label">NÚMERO SOPORTE:</label>
                    <input
                        type="text"
                        className="input"
                        value={supportNumber}
                        onChange={(e) => setSupportNumber(e.target.value)}
                    />
                </div>

                <div className="input-row">
                    <label className="input-label">PANEL USUARIO:</label>
                    <input
                        type="text"
                        className="input"
                        value={panelUser}
                        onChange={(e) => setPanelUser(e.target.value)}
                    />
                </div>

                <div className="input-row">
                    <label className="input-label">PANEL CONTRASEÑA:</label>
                    <input
                        type="text"
                        className="input"
                        value={panelPassword}
                        onChange={(e) => setPanelPassword(e.target.value)}
                    />
                </div>

                <div className="input-row">
                    <label className="input-label">NOMBRE PAGINA:</label>
                    <input
                        type="text"
                        className="input"
                        value={nombrePagina}
                        onChange={(e) => setNombrePagina(e.target.value)}
                    />
                </div>

                <div className="button-row" style={{ marginTop: '16px', display: 'flex', justifyContent: 'flex-end' }}>
                    <button
                        onClick={handleSave}
                        disabled={isSaving}
                        style={{
                            background: 'rgba(34, 197, 94, 0.9)',
                            border: 'none',
                            borderRadius: '8px',
                            padding: '10px 16px',
                            color: '#fff',
                            cursor: isSaving ? 'not-allowed' : 'pointer',
                            fontSize: '14px',
                            fontWeight: '500',
                            transition: 'background 0.2s ease',
                        }}
                        onMouseEnter={(e) => {
                            if (!isSaving) e.target.style.background = 'rgba(34, 197, 94, 1)';
                        }}
                        onMouseLeave={(e) => {
                            if (!isSaving) e.target.style.background = 'rgba(34, 197, 94, 0.9)';
                        }}
                    >
                        {isSaving ? 'Guardando...' : 'Guardar'}
                    </button>
                </div>
            </div>
        </div>
    );
}
