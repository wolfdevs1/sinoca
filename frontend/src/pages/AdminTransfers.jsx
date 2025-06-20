import { useEffect, useState } from 'react';
import { getTransfers } from '../services/auth';
import { useNavigate } from 'react-router-dom';
import { NumericFormat } from 'react-number-format';

export default function AdminTransfers() {
    const [transfers, setTransfers] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('unused'); // 'unused' o 'used'

    const [page, setPage] = useState(1);
    const [pages, setPages] = useState(1);
    const limit = 10;

    const navigate = useNavigate();

    useEffect(() => {
        const loadData = async () => {
            try {
                const res = await getTransfers(page, limit, searchTerm, filterStatus);
                const { transfers, page: curr, pages: totalPages } = res.data;
                setTransfers(transfers);
                setPages(totalPages);
                setPage(curr);
            } catch (err) {
                console.error(err);
            }
        };
        loadData();
    }, [page, searchTerm, filterStatus]);

    useEffect(() => {
        setPage(1);
    }, [searchTerm, filterStatus]);

    const handleGoBack = () => {
        navigate('/admin');
    };

    return (
        <div className="admin-container">
            {/* Header */}
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
                        transition: 'all 0.2s ease'
                    }}
                >
                    <span style={{ fontSize: '16px' }}>←</span>
                    <span>Volver</span>
                </button>
                <div className="titulo-profesional">Transferencias</div>
            </div>

            {/* Controles */}
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
                        className={`filter-btn ${filterStatus === 'unused' ? 'active' : ''}`}
                        onClick={() => setFilterStatus('unused')}
                    >
                        Sin usar
                    </button>
                    <button
                        className={`filter-btn ${filterStatus === 'used' ? 'active' : ''}`}
                        onClick={() => setFilterStatus('used')}
                    >
                        Usadas
                    </button>
                </div>
            </div>

            {/* Vista escritorio */}
            <div className="table-container desktop-view">
                {transfers.length === 0 ? (
                    <div className="empty-state">
                        <p>No hay transferencias que coincidan con los filtros</p>
                    </div>
                ) : (
                    <table className="retiros-table">
                        <thead>
                            <tr>
                                <th>Usuario</th>
                                <th>Alias</th>
                                <th>Cantidad</th>
                                <th>Fecha ingreso</th>
                                <th>Fecha reclamo</th>
                            </tr>
                        </thead>
                        <tbody>
                            {transfers.map(transfer => (
                                <tr key={transfer._id} className={transfer.used ? 'completed' : 'pending'}>
                                    <td className="user-name">{transfer.user}</td>
                                    <td className="user-name">{transfer.account}</td>
                                    <td className="amount">
                                        <NumericFormat
                                            value={transfer.amount}
                                            displayType="text"
                                            thousandSeparator="."
                                            decimalSeparator=","
                                            prefix="$"
                                        />
                                    </td>
                                    <td>{new Date(transfer.createdAt).toLocaleString('es-AR')}</td>
                                    <td>
                                        {transfer.used
                                            ? new Date(transfer.updatedAt).toLocaleString('es-AR')
                                            : '-'}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>

            {/* Vista móvil */}
            <div className="mobile-view">
                {transfers.length === 0 ? (
                    <div className="empty-state">
                        <p>No hay transferencias que coincidan con los filtros</p>
                    </div>
                ) : (
                    <div className="cards-container">
                        {transfers.map(transfer => (
                            <div
                                key={transfer._id}
                                className={`withdraw-card ${transfer.used ? 'completed' : 'pending'}`}
                            >
                                <div className="card-header">
                                    <div className="user-info">
                                        <h3 className="card-user-name">{transfer.name}</h3>
                                        <p className="card-user-alias">{transfer.account}</p>
                                    </div>
                                    <div className="card-amount">
                                        <NumericFormat
                                            value={transfer.amount}
                                            displayType="text"
                                            thousandSeparator="."
                                            decimalSeparator=","
                                            prefix="$"
                                        />
                                    </div>
                                    <div className="card-dates">
                                        <p>
                                            <strong>Ingreso:</strong>{' '}
                                            {new Date(transfer.createdAt).toLocaleString('es-AR')}
                                        </p>
                                        {transfer.used && (
                                            <p>
                                                <strong>Reclamado:</strong>{' '}
                                                {new Date(transfer.updatedAt).toLocaleString('es-AR')}
                                            </p>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Paginación */}
            <div className="pagination">
                <button disabled={page <= 1} onClick={() => setPage(page - 1)}>
                    ←
                </button>
                <span> {page} / {pages} </span>
                <button disabled={page >= pages} onClick={() => setPage(page + 1)}>
                    →
                </button>
            </div>
        </div>
    );
}