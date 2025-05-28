import { useEffect, useState, useContext } from 'react';
import { getWithdraws, changeWithdrawState as changeWithdrawStateAPI } from '../services/auth';
import { AuthContext } from '../context/AuthContext';

export default function AdminPage() {
    const [withdraws, setWithdraws] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('all'); // 'all', 'pending', 'completed'
    const { logout } = useContext(AuthContext);

    useEffect(() => {
        const fetchWithdraws = async () => {
            try {
                const { data } = await getWithdraws();
                setWithdraws(data);
            } catch (err) {
                console.error('Error al obtener retiros:', err);
            }
        };

        fetchWithdraws();
    }, []);

    const changeWithdrawState = async (value, id) => {
        try {
            await changeWithdrawStateAPI({ id, value });
            const updated = await getWithdraws();
            setWithdraws(updated.data);
        } catch (error) {
            console.error("Error al cambiar estado del retiro:", error);
        }
    };

    const handleSend = (withdrawId) => {
        console.log('Enviando retiro:', withdrawId);
        // Aquí implementarás la lógica de envío
    };

    const handleBankChange = (withdrawId, bank) => {
        console.log('Cambiando banco:', withdrawId, bank);
        // Aquí implementarás la lógica de cambio de banco
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
                                            defaultValue="Banco1"
                                            onChange={(e) => handleBankChange(withdraw._id, e.target.value)}
                                        >
                                            <option value="Banco1">Banco1</option>
                                            <option value="Banco2">Banco2</option>
                                            <option value="Banco3">Banco3</option>
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
                                            className="card-bank-select"
                                            defaultValue="Banco1"
                                            onChange={(e) => handleBankChange(withdraw._id, e.target.value)}
                                        >
                                            <option value="Banco1">Banco1</option>
                                            <option value="Banco2">Banco2</option>
                                            <option value="Banco3">Banco3</option>
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

            <style jsx>{`
                .admin-container {
                    width: 100%;
                    max-width: 1200px;
                    margin: 0 auto;
                    padding: 20px;
                    background-color: rgba(31, 41, 55, 0.9);
                    border-radius: 12px;
                    box-shadow: 0 6px 20px rgba(0, 0, 0, 0.4);
                    backdrop-filter: blur(10px);
                    border: 1px solid rgba(255, 255, 255, 0.1);
                    animation: fadeIn 0.3s ease-in-out;
                }

                @keyframes fadeIn {
                    0% {
                        opacity: 0;
                        transform: translateY(-20px);
                    }
                    100% {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }

                .admin-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 30px;
                    padding-bottom: 20px;
                    border-bottom: 1px solid rgba(255, 255, 255, 0.2);
                }

                .admin-title {
                    font-size: 2rem;
                    font-weight: 600;
                    color: #e5e7eb;
                    margin: 0;
                }

                .logout-btn {
                    background: linear-gradient(135deg, #ef4444, #dc2626);
                    color: white;
                    border: none;
                    padding: 10px 20px;
                    border-radius: 8px;
                    font-weight: 600;
                    cursor: pointer;
                    transition: all 0.3s ease;
                    box-shadow: 0 2px 10px rgba(239, 68, 68, 0.3);
                }

                .logout-btn:hover {
                    background: linear-gradient(135deg, #dc2626, #b91c1c);
                    transform: translateY(-2px);
                    box-shadow: 0 4px 15px rgba(239, 68, 68, 0.4);
                }

                .admin-controls {
                    display: flex;
                    flex-direction: column;
                    gap: 20px;
                    margin-bottom: 30px;
                }

                @media (min-width: 768px) {
                    .admin-controls {
                        flex-direction: row;
                        justify-content: space-between;
                        align-items: center;
                    }
                }

                .search-container {
                    flex: 1;
                    max-width: 400px;
                }

                .search-input {
                    width: 100%;
                    padding: 12px 16px;
                    background-color: rgba(17, 24, 39, 0.7);
                    border: 1px solid rgba(255, 255, 255, 0.2);
                    border-radius: 8px;
                    color: #e5e7eb;
                    font-size: 14px;
                    transition: all 0.3s ease;
                }

                .search-input:focus {
                    outline: none;
                    border-color: #3b82f6;
                    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
                }

                .search-input::placeholder {
                    color: #9ca3af;
                }

                .filter-container {
                    display: flex;
                    gap: 8px;
                }

                .filter-btn {
                    padding: 10px 16px;
                    background-color: rgba(17, 24, 39, 0.7);
                    border: 1px solid rgba(255, 255, 255, 0.2);
                    border-radius: 8px;
                    color: #e5e7eb;
                    font-size: 14px;
                    font-weight: 500;
                    cursor: pointer;
                    transition: all 0.3s ease;
                }

                .filter-btn:hover {
                    background-color: rgba(17, 24, 39, 0.9);
                    border-color: rgba(255, 255, 255, 0.3);
                }

                .filter-btn.active {
                    background: linear-gradient(135deg, #3b82f6, #2563eb);
                    border-color: #3b82f6;
                    color: white;
                    box-shadow: 0 2px 10px rgba(59, 130, 246, 0.3);
                }

                /* Desktop & Tablet View */
                .desktop-view {
                    display: none;
                }

                @media (min-width: 768px) {
                    .desktop-view {
                        display: block;
                    }
                }

                .table-container {
                    overflow-x: auto;
                    border-radius: 8px;
                    border: 1px solid rgba(255, 255, 255, 0.1);
                }

                .retiros-table {
                    width: 100%;
                    border-collapse: collapse;
                    background-color: rgba(17, 24, 39, 0.5);
                }

                .retiros-table th {
                    background-color: rgba(17, 24, 39, 0.8);
                    padding: 16px 12px;
                    text-align: left;
                    font-weight: 600;
                    color: #f3f4f6;
                    border-bottom: 2px solid rgba(255, 255, 255, 0.1);
                    font-size: 14px;
                }

                .retiros-table td {
                    padding: 14px 12px;
                    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
                    font-size: 14px;
                }

                .retiros-table tr.pending {
                    background-color: rgba(251, 146, 60, 0.1);
                }

                .retiros-table tr.completed {
                    background-color: rgba(34, 197, 94, 0.1);
                }

                .retiros-table tr:hover {
                    background-color: rgba(255, 255, 255, 0.05);
                }

                .user-name {
                    font-weight: 600;
                    color: #f3f4f6;
                }

                .user-alias {
                    color: #9ca3af;
                    font-family: monospace;
                }

                .amount {
                    font-weight: 600;
                    color: #10b981;
                }

                .bank-select {
                    width: 100%;
                    padding: 8px 12px;
                    background-color: rgba(17, 24, 39, 0.7);
                    border: 1px solid rgba(255, 255, 255, 0.2);
                    border-radius: 6px;
                    color: #e5e7eb;
                    font-size: 13px;
                    cursor: pointer;
                }

                .bank-select:focus {
                    outline: none;
                    border-color: #3b82f6;
                }

                .send-btn {
                    background: linear-gradient(135deg, #10b981, #059669);
                    color: white;
                    border: none;
                    padding: 8px 16px;
                    border-radius: 6px;
                    font-size: 13px;
                    font-weight: 600;
                    cursor: pointer;
                    transition: all 0.3s ease;
                    width: 100%;
                    box-shadow: 0 2px 8px rgba(16, 185, 129, 0.3);
                }

                .send-btn:hover {
                    background: linear-gradient(135deg, #059669, #047857);
                    transform: translateY(-1px);
                    box-shadow: 0 4px 12px rgba(16, 185, 129, 0.4);
                }

                .empty-state {
                    text-align: center;
                    padding: 40px 20px;
                    color: #9ca3af;
                    font-size: 16px;
                }

                /* Mobile Card View */
                .mobile-view {
                    display: block;
                }

                @media (min-width: 768px) {
                    .mobile-view {
                        display: none;
                    }
                }

                .cards-container {
                    display: flex;
                    flex-direction: column;
                    gap: 16px;
                }

                .withdraw-card {
                    background-color: rgba(17, 24, 39, 0.7);
                    border-radius: 12px;
                    border: 1px solid rgba(255, 255, 255, 0.1);
                    overflow: hidden;
                    transition: all 0.3s ease;
                    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
                }

                .withdraw-card:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 8px 20px rgba(0, 0, 0, 0.4);
                }

                .withdraw-card.pending {
                    border-left: 4px solid #f59e0b;
                    background-color: rgba(251, 146, 60, 0.05);
                }

                .withdraw-card.completed {
                    border-left: 4px solid #10b981;
                    background-color: rgba(16, 185, 129, 0.05);
                }

                .card-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: flex-start;
                    padding: 20px 20px 12px 20px;
                    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
                }

                .user-info {
                    flex: 1;
                }

                .card-user-name {
                    font-size: 18px;
                    font-weight: 600;
                    color: #f3f4f6;
                    margin: 0 0 4px 0;
                }

                .card-user-alias {
                    font-size: 14px;
                    color: #9ca3af;
                    font-family: monospace;
                    margin: 0;
                }

                .card-amount {
                    font-size: 24px;
                    font-weight: 700;
                    color: #10b981;
                    background: linear-gradient(135deg, #10b981, #059669);
                    -webkit-background-clip: text;
                    -webkit-text-fill-color: transparent;
                    background-clip: text;
                }

                .card-body {
                    padding: 16px 20px;
                }

                .card-field {
                    display: flex;
                    flex-direction: column;
                    gap: 8px;
                }

                .card-label {
                    font-size: 14px;
                    font-weight: 600;
                    color: #d1d5db;
                }

                .card-bank-select {
                    width: 100%;
                    padding: 12px 16px;
                    background-color: rgba(31, 41, 55, 0.8);
                    border: 1px solid rgba(255, 255, 255, 0.2);
                    border-radius: 8px;
                    color: #e5e7eb;
                    font-size: 16px;
                    cursor: pointer;
                    transition: all 0.3s ease;
                }

                .card-bank-select:focus {
                    outline: none;
                    border-color: #3b82f6;
                    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
                }

                .card-footer {
                    padding: 16px 20px 20px 20px;
                }

                .card-send-btn {
                    width: 50%;
                    background: linear-gradient(135deg, #10b981, #059669);
                    color: white;
                    border: none;
                    padding: 14px 20px;
                    border-radius: 8px;
                    font-size: 16px;
                    font-weight: 600;
                    cursor: pointer;
                    transition: all 0.3s ease;
                    box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);
                }

                .card-send-btn:hover {
                    background: linear-gradient(135deg, #059669, #047857);
                    transform: translateY(-2px);
                    box-shadow: 0 6px 16px rgba(16, 185, 129, 0.4);
                }

                .card-send-btn:active {
                    transform: translateY(0);
                }

                /* Responsive Design - Mobile */
                @media (max-width: 480px) {
                    .admin-container {
                        padding: 12px;
                        margin: 8px;
                        border-radius: 8px;
                    }

                    .admin-title {
                        font-size: 1.75rem;
                        text-align: center;
                    }

                    .admin-header {
                        flex-direction: column;
                        gap: 16px;
                        align-items: center;
                        text-align: center;
                    }

                    .logout-btn {
                        width: 100%;
                        max-width: 200px;
                    }

                    .admin-controls {
                        gap: 16px;
                    }

                    .search-container {
                        max-width: none;
                    }

                    .search-input {
                        padding: 14px 16px;
                        font-size: 16px;
                    }

                    .filter-container {
                        flex-wrap: wrap;
                        justify-content: center;
                    }

                    .filter-btn {
                        flex: 1;
                        padding: 12px 14px;
                        font-size: 14px;
                    }

                    .card-header {
                        padding: 16px 16px 12px 16px;
                        flex-direction: column;
                        gap: 12px;
                        align-items: center;
                        text-align: center;
                    }

                    .card-amount {
                        font-size: 28px;
                    }

                    .card-body {
                        padding: 12px 16px;
                    }

                    .card-footer {
                        padding: 12px 16px 16px 16px;
                    }

                    .cards-container {
                        gap: 12px;
                    }
                }

                /* Responsive Design - Tablet */
                @media (min-width: 768px) and (max-width: 1024px) {
                    .admin-container {
                        padding: 20px;
                        margin: 15px;
                    }

                    .admin-controls {
                        flex-direction: column;
                        gap: 20px;
                        align-items: stretch;
                    }

                    .search-container {
                        max-width: none;
                    }

                    .filter-container {
                        justify-content: center;
                    }

                    .retiros-table th,
                    .retiros-table td {
                        padding: 12px 10px;
                        font-size: 13px;
                    }

                    .bank-select {
                        padding: 6px 10px;
                        font-size: 12px;
                    }

                    .send-btn {
                        padding: 6px 12px;
                        font-size: 12px;
                    }
                }

                /* Responsive Design - Large Desktop */
                @media (min-width: 1200px) {
                    .admin-container {
                        width: 65vw;
                        padding: 30px;
                    }

                    .admin-title {
                        font-size: 2.5rem;
                    }

                    .retiros-table th,
                    .retiros-table td {
                        padding: 18px 16px;
                        font-size: 15px;
                    }

                    .bank-select {
                        padding: 10px 14px;
                        font-size: 14px;
                    }

                    .send-btn {
                        padding: 10px 10px;
                        font-size: 14px;
                    }

                    .search-input {
                        padding: 14px 18px;
                        font-size: 15px;
                    }

                    .filter-btn {
                        padding: 12px 20px;
                        font-size: 15px;
                    }
                }
            `}</style>
        </div>
    );
}