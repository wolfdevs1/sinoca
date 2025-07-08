import { useEffect, useState } from 'react';
import {
    getWithdraws,
    changeWithdrawState as changeWithdrawStateAPI,
    getAccounts as getAccountsAPI
} from '../services/auth';
import { useNavigate } from 'react-router-dom';
import { NumericFormat } from 'react-number-format';

export default function AdminWithdraw() {
    const [withdraws, setWithdraws] = useState([]);
    const [bankList, setBankList] = useState([]);
    const [selectedBanks, setSelectedBanks] = useState({});
    const [pages, setPages] = useState(1);
    const limit = 10;

    const [filters, setFilters] = useState({
        searchTerm: '',
        filterStatus: 'pending',
        page: 1,
    });

    const navigate = useNavigate();

    useEffect(() => {
        const loadData = async () => {
            try {
                const [{ data: wResp }, { data: bResp }] = await Promise.all([
                    getWithdraws(filters.page, limit, filters.searchTerm),
                    getAccountsAPI()
                ]);

                const { withdraws, pages: totalPages } = wResp;
                setWithdraws(withdraws);
                setPages(totalPages);

                setBankList(bResp);
                const initBanks = {};
                withdraws.forEach(w => {
                    initBanks[w._id] = w.withdrawAccount || (bResp[0]?.name || '');
                });
                setSelectedBanks(initBanks);
            } catch (err) {
                console.error(err);
            }
        };
        loadData();
    }, [filters]);

    const handleSearch = (value) => {
        setFilters((prev) => ({
            ...prev,
            searchTerm: value,
            page: 1,
        }));
    };

    const handleFilterStatus = (status) => {
        setFilters((prev) => ({
            ...prev,
            filterStatus: status,
            page: 1,
        }));
    };

    const handlePageChange = (newPage) => {
        setFilters((prev) => ({
            ...prev,
            page: newPage,
        }));
    };

    const handleBankChange = (withdrawId, bank) => {
        setSelectedBanks(prev => ({ ...prev, [withdrawId]: bank }));
    };

    const handleSend = async (withdrawId) => {
        const selectedBank = selectedBanks[withdrawId];
        if (!selectedBank) {
            alert("Por favor selecciona un banco antes de enviar el retiro.");
            return;
        }
        try {
            await changeWithdrawStateAPI({ withdrawId, withdrawAccount: selectedBank });
            setFilters((prev) => ({ ...prev }));  // Refresca datos
        } catch (error) {
            console.error("Error al cambiar estado del retiro:", error);
        }
    };

    const filtered = withdraws.filter(w =>
        (filters.filterStatus === 'pending' && !w.state) ||
        (filters.filterStatus === 'completed' && w.state)
    );

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
                        value={filters.searchTerm}
                        onChange={(e) => handleSearch(e.target.value)}
                    />
                </div>

                <div className="filter-container">
                    <button
                        className={`filter-btn ${filters.filterStatus === 'pending' ? 'active' : ''}`}
                        onClick={() => handleFilterStatus('pending')}
                    >
                        Pendientes
                    </button>
                    <button
                        className={`filter-btn ${filters.filterStatus === 'completed' ? 'active' : ''}`}
                        onClick={() => handleFilterStatus('completed')}
                    >
                        Completados
                    </button>
                </div>
            </div>

            <div className="table-container desktop-view">
                {filtered.length === 0 ? (
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
                            {filtered.map(withdraw => (
                                <tr key={withdraw._id} className={withdraw.state ? 'completed' : 'pending'}>
                                    <td className="user-name">{withdraw.name}</td>
                                    <td className="user-name">{withdraw.account}</td>
                                    <td className="amount">
                                        <NumericFormat
                                            value={withdraw.amount}
                                            displayType="text"
                                            thousandSeparator="."
                                            decimalSeparator=","
                                            prefix="$"
                                        />
                                    </td>
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
                {filtered.length === 0 ? (
                    <div className="empty-state">
                        <p>No hay retiros que coincidan con los filtros</p>
                    </div>
                ) : (
                    <div className="cards-container">
                        {filtered.map(withdraw => (
                            <div key={withdraw._id} className={`withdraw-card ${withdraw.state ? 'completed' : 'pending'}`}>
                                <div className="card-header">
                                    <div className="user-info">
                                        <h3 className="card-user-name">{withdraw.name}</h3>
                                    </div>
                                    <div className="card-amount">
                                        <NumericFormat
                                            value={withdraw.amount}
                                            displayType="text"
                                            thousandSeparator="."
                                            decimalSeparator=","
                                            prefix="$"
                                        />
                                    </div>
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

            <div className="pagination">
                <button
                    disabled={filters.page <= 1}
                    onClick={() => handlePageChange(filters.page - 1)}
                >
                    ←
                </button>
                <span> {filters.page} / {pages} </span>
                <button
                    disabled={filters.page >= pages}
                    onClick={() => handlePageChange(filters.page + 1)}
                >
                    →
                </button>
            </div>
        </div>
    );
}