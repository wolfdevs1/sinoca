import { useEffect, useState, useContext } from 'react';
import { getWithdraws, changeWithdrawState as changeWithdrawStateAPI, getAccounts as getAccountsAPI } from '../services/auth';
import { AuthContext } from '../context/AuthContext';

export default function AdminWithdraw() {
    const [selectedBanks, setSelectedBanks] = useState({});
    const [bankList, setBankList] = useState([]);
    const [withdraws, setWithdraws] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('all'); // 'all', 'pending', 'completed'
    const { logout } = useContext(AuthContext);

    useEffect(() => {
        const fetchWithdraws = async () => {
            try {
                const { data } = await getWithdraws();
                setWithdraws(data);

                const initialBanks = {};
                data.forEach(w => {
                    initialBanks[w._id] = w.withdrawAccount || '';
                });
                setSelectedBanks(initialBanks);
            } catch (err) {
                console.error('Error al obtener retiros:', err);
            }
        };

        const fetchBanks = async () => {
            try {
                const { data } = await getAccountsAPI();
                setBankList(data); // [{ name: 'Banco Nación', alias: 'Banco1' }, ...]
            } catch (err) {
                console.error('Error al obtener bancos:', err);
            }
        };

        fetchWithdraws();
        fetchBanks();
    }, []);

    const handleSend = async (withdrawId) => {
        const selectedBank = selectedBanks[withdrawId];
        if (!selectedBank) {
            alert("Por favor selecciona un banco antes de enviar el retiro.");
            return;
        }
        try {
            await changeWithdrawStateAPI({ withdrawId, withdrawAccount: selectedBank });
            const updated = await getWithdraws();
            setWithdraws(updated.data);
        } catch (error) {
            console.error("Error al cambiar estado del retiro:", error);
        }
    };

    const handleBankChange = (withdrawId, bank) => {
        setSelectedBanks(prev => ({ ...prev, [withdrawId]: bank }));
    };

    // Filtrar retiros basado en búsqueda y estado
    const filteredWithdraws = withdraws.filter(withdraw => {
        const matchesSearch = withdraw.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            withdraw.phone.includes(searchTerm) ||
            withdraw.account.toLowerCase().includes(searchTerm.toLowerCase());

        const matchesFilter = filterStatus === 'all' ||
            (filterStatus === 'pending' && !withdraw.state) ||
            (filterStatus === 'completed' && withdraw.state);

        return matchesSearch && matchesFilter;
    });

    return (
        <div className="admin-container">
            <div className="admin-header">
                <h1 className="admin-title">Retiros</h1>
                <button className="logout-btn" onClick={logout}>
                    Cerrar Sesión
                </button>
            </div>

            <div className="admin-controls">
                <div className="search-container">
                    <input
                        type="text"
                        className="search-input"
                        placeholder="Buscar por usuario, teléfono o cuenta..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>

                <div className="filter-container">
                    <button
                        className={`filter-btn ${filterStatus === 'all' ? 'active' : ''}`}
                        onClick={() => setFilterStatus('all')}
                    >
                        Todos
                    </button>
                    <button
                        className={`filter-btn ${filterStatus === 'pending' ? 'active' : ''}`}
                        onClick={() => setFilterStatus('pending')}
                    >
                        Pendientes
                    </button>
                    <button
                        className={`filter-btn ${filterStatus === 'completed' ? 'active' : ''}`}
                        onClick={() => setFilterStatus('completed')}
                    >
                        Completados
                    </button>
                </div>
            </div>

            {/* Desktop & Tablet Table View */}
            <div className="table-container desktop-view">
                {filteredWithdraws.length === 0 ? (
                    <div className="empty-state">
                        <p>No hay retiros que coincidan con los filtros</p>
                    </div>
                ) : (
                    <table className="retiros-table">
                        <thead>
                            <tr>
                                <th>Usuario</th>
                                <th>Alias Usuario</th>
                                <th>Cantidad</th>
                                <th>Cuenta Pago</th>
                                <th>Enviar</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredWithdraws.map(withdraw => (
                                <tr key={withdraw._id} className={withdraw.state ? 'completed' : 'pending'}>
                                    <td className="user-name">{withdraw.name}</td>
                                    <td className="user-alias">{withdraw.phone.replace('549', '').replace('@c.us', '')}</td>
                                    <td className="amount">${withdraw.amount}</td>
                                    <td className="bank-select-cell">
                                        <select
                                            className="bank-select"
                                            value={selectedBanks[withdraw._id] || 'Banco1'}
                                            onChange={(e) => handleBankChange(withdraw._id, e.target.value)}
                                        >
                                            {bankList.map(bank => (
                                                <option key={bank.id} value={bank.id}>
                                                    {bank.name}
                                                </option>
                                            ))}
                                        </select>
                                    </td>
                                    <td className="send-cell">
                                        <button
                                            className="send-btn"
                                            onClick={() => handleSend(withdraw._id)}
                                        >
                                            Enviar
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>

            {/* Mobile Card View */}
            <div className="mobile-view">
                {filteredWithdraws.length === 0 ? (
                    <div className="empty-state">
                        <p>No hay retiros que coincidan con los filtros</p>
                    </div>
                ) : (
                    <div className="cards-container">
                        {filteredWithdraws.map(withdraw => (
                            <div key={withdraw._id} className={`withdraw-card ${withdraw.state ? 'completed' : 'pending'}`}>
                                <div className="card-header">
                                    <div className="user-info">
                                        <h3 className="card-user-name">{withdraw.name}</h3>
                                        <p className="card-user-alias">{withdraw.phone.replace('549', '').replace('@c.us', '')}</p>
                                    </div>
                                    <div className="card-amount">${withdraw.amount}</div>
                                </div>

                                <div className="card-body">
                                    <div className="card-field">
                                        <label className="card-label">Cuenta de Pago:</label>
                                        <select
                                            className="bank-select"
                                            value={selectedBanks[withdraw._id] || 'Banco1'}
                                            onChange={(e) => handleBankChange(withdraw._id, e.target.value)}
                                        >
                                            {bankList.map(bank => (
                                                <option key={bank.id} value={bank.id}>
                                                    {bank.name}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                </div>

                                <div className="card-footer">
                                    <button
                                        className="card-send-btn"
                                        onClick={() => handleSend(withdraw._id)}
                                    >
                                        Enviar Pago
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}