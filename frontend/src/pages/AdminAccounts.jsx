import { useEffect, useState } from 'react';
import {
    getAccounts as getAccountsAPI,
    addAccount as addAccountAPI,
    deleteAccount as deleteAccountAPI
} from '../services/auth';

export default function AdminAccounts() {
    const [accounts, setAccounts] = useState([]);
    const [newAccount, setNewAccount] = useState({ name: '', alias: '' });

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
            fetchAccounts(); // Refrescar lista
        } catch (error) {
            console.error('Error al agregar cuenta:', error);
        }
    };

    const handleDeleteAccount = async (id) => {
        const confirmDelete = window.confirm(`¿Estás seguro de eliminar la cuenta "${id}"?`);
        if (!confirmDelete) return;

        try {
            await deleteAccountAPI({ id });
            fetchAccounts(); // Refrescar lista
        } catch (error) {
            console.error('Error al eliminar cuenta:', error);
        }
    };

    return (
        <div className="admin-accounts">
            <h1>Cuentas Bancarias</h1>

            <form onSubmit={handleAddAccount} className="account-form">
                <input
                    type="text"
                    placeholder="Nombre del banco"
                    value={newAccount.name}
                    onChange={(e) => setNewAccount({ ...newAccount, name: e.target.value })}
                />
                <input
                    type="text"
                    placeholder="Alias"
                    value={newAccount.alias}
                    onChange={(e) => setNewAccount({ ...newAccount, alias: e.target.value })}
                />
                <button type="submit">Agregar Cuenta</button>
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
};