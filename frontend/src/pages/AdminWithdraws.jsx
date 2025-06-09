import { useEffect, useState } from 'react';
import {
    getWithdraws,
    changeWithdrawState as changeWithdrawStateAPI,
    getAccounts as getAccountsAPI
} from '../services/auth';
import { useNavigate } from 'react-router-dom';

export default function AdminWithdraw() {
    const [selectedBanks, setSelectedBanks] = useState({});
    const [bankList, setBankList] = useState([]);
    const [withdraws, setWithdraws] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('pending');
    const navigate = useNavigate();

    useEffect(() => {
        const loadData = async () => {
            try {
                const [withdrawRes, bankRes] = await Promise.all([
                    getWithdraws(),
                    getAccountsAPI()
                ]);
                const withdrawData = withdrawRes.data;
                const bankData = bankRes.data;
                setBankList(bankData);

                const initialBanks = {};
                withdrawData.forEach(w => {
                    initialBanks[w._id] = w.withdrawAccount || (bankData.length > 0 ? bankData[0].name : '');
                });
                setSelectedBanks(initialBanks);
                setWithdraws(withdrawData);
            } catch (err) {
                console.error('Error al cargar datos:', err);
            }
        };

        loadData();
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

    const handleGoBack = () => {
        navigate('/admin');
    };

    const filteredWithdraws = withdraws.filter(withdraw => {
        const matchesSearch =
            withdraw.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            withdraw.phone.includes(searchTerm) ||
            withdraw.account.toLowerCase().includes(searchTerm.toLowerCase());

        const matchesFilter =
            (filterStatus === 'pending' && !withdraw.state) ||
            (filterStatus === 'completed' && withdraw.state);

        return matchesSearch && matchesFilter;
    });

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
                <div className='titulo-profesional'>Retiros</div>
            </div>

            <div className="admin-controls">
                <div className="search-container">
                    <input
                        type="text"
                        className="search-input"
                        placeholder="Buscar..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>

                <div className="filter-container">
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
                                <th>Alias</th>
                                <th>Cantidad</th>
                                <th>Cuenta Pago</th>
                                <th>Seleccione</th>
                                <th>Enviar</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredWithdraws.map(withdraw => (
                                <tr key={withdraw._id} className={withdraw.state ? 'completed' : 'pending'}>
                                    <td className="user-name">{withdraw.name}</td>
                                    <td className="user-name">{withdraw.account}</td>
                                    <td className="amount">${withdraw.amount}</td>
                                    <td className="user-name">{withdraw.withdrawAccount}</td>
                                    <td className="bank-select-cell">
                                        <select
                                            className="bank-select"
                                            value={selectedBanks[withdraw._id] || ''}
                                            onChange={(e) => handleBankChange(withdraw._id, e.target.value)}
                                        >
                                            <option value=""></option>
                                            {bankList.map(bank => (
                                                <option key={bank._id} value={bank.name}>
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
                                            value={selectedBanks[withdraw._id] || ''}
                                            onChange={(e) => handleBankChange(withdraw._id, e.target.value)}
                                        >
                                            {bankList.map(bank => (
                                                <option key={bank._id} value={bank.name}>
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
