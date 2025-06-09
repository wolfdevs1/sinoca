import { useEffect, useState } from 'react';
import {
    getAccounts as getAccountsAPI,
    addAccount as addAccountAPI,
    deleteAccount as deleteAccountAPI
} from '../services/auth';
import { useNavigate } from 'react-router-dom';

export default function AdminAccounts() {
    const [accounts, setAccounts] = useState([]);
    const [newAccount, setNewAccount] = useState({ name: '', alias: '' });
    const navigate = useNavigate();

    useEffect(() => {
        fetchAccounts();
    }, []);

    const fetchAccounts = async () => {
        try {
            const { data } = await getAccountsAPI();
            setAccounts(data);
        } catch (error) {
            console.error('Error al obtener cuentas:', error);
        }
    };

    const handleAddAccount = async (e) => {
        e.preventDefault();

        if (!newAccount.name || !newAccount.alias) {
            alert('Por favor completa ambos campos.');
            return;
        }

        try {
            await addAccountAPI(newAccount);
            setNewAccount({ name: '', alias: '' });
            fetchAccounts();
        } catch (error) {
            console.error('Error al agregar cuenta:', error);
        }
    };

    const handleDeleteAccount = async (id) => {
        const confirmDelete = window.confirm(`¿Estás seguro de eliminar la cuenta "${id}"?`);
        if (!confirmDelete) return;

        try {
            await deleteAccountAPI({ id });
            fetchAccounts();
        } catch (error) {
            console.error('Error al eliminar cuenta:', error);
        }
    };

    const handleGoBack = () => {
        navigate('/admin'); // Ajusta si tu ruta de admin es diferente
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
                <div className='titulo-profesional'>Cuentas</div>
            </div>
            <form onSubmit={handleAddAccount} className="account-form">
                <input
                    className='input'
                    type="text"
                    placeholder="Nombre del banco"
                    value={newAccount.name}
                    onChange={(e) => setNewAccount({ ...newAccount, name: e.target.value })}
                />
                <input
                    className='input'
                    type="text"
                    placeholder="Alias"
                    value={newAccount.alias}
                    onChange={(e) => setNewAccount({ ...newAccount, alias: e.target.value })}
                />
                <button className='btn' type="submit">Agregar Cuenta</button>
            </form>

            <div className="account-list">
                {accounts.length === 0 ? (
                    <p>No hay cuentas registradas.</p>
                ) : (
                    <table>
                        <thead>
                            <tr>
                                <th>Nombre</th>
                                <th>Alias</th>
                                <th>Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {accounts.map(account => (
                                <tr key={account.alias}>
                                    <td>{account.name}</td>
                                    <td>{account.alias}</td>
                                    <td>
                                        <button onClick={() => handleDeleteAccount(account._id)}>
                                            Eliminar
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
}
