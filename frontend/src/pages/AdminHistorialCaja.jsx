import { useEffect, useState } from 'react';
import { getHistorialCaja } from '../services/auth';
import { useNavigate } from 'react-router-dom';
import { NumericFormat } from 'react-number-format';

export default function AdminHistorialCaja() {
    const [historial, setHistorial] = useState([]);
    const [pages, setPages] = useState(1);
    const limit = 10;

    const [filters, setFilters] = useState({
        searchTerm: '',
        filterType: 'ingreso',
        page: 1,
    });

    const navigate = useNavigate();

    useEffect(() => {
        const fetchData = async () => {
            try {
                const res = await getHistorialCaja(
                    filters.page,
                    limit,
                    filters.searchTerm,
                    filters.filterType
                );
                const { historial, pages: totalPages } = res.data;
                setHistorial(historial);
                setPages(totalPages);
            } catch (err) {
                console.error(err);
            }
        };
        fetchData();
    }, [filters]);

    const handleSearch = (value) => {
        setFilters((prev) => ({
            ...prev,
            searchTerm: value,
            page: 1,
        }));
    };

    const handleFilterType = (type) => {
        setFilters((prev) => ({
            ...prev,
            filterType: type,
            page: 1,
        }));
    };

    const handlePageChange = (newPage) => {
        setFilters((prev) => ({
            ...prev,
            page: newPage,
        }));
    };

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
                        transition: 'all 0.2s ease',
                    }}
                >
                    <span style={{ fontSize: '16px' }}>←</span>
                    <span>Volver</span>
                </button>
                <div className="titulo-profesional">Historial de Caja</div>
            </div>

            {/* Controles */}
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
                        className={`filter-btn ${filters.filterType === 'ingreso' ? 'active' : ''}`}
                        onClick={() => handleFilterType('ingreso')}
                    >
                        Ingresos
                    </button>
                    <button
                        className={`filter-btn ${filters.filterType === 'egreso' ? 'active' : ''}`}
                        onClick={() => handleFilterType('egreso')}
                    >
                        Egresos
                    </button>
                    <button
                        className={`filter-btn ${filters.filterType === 'aporte' ? 'active' : ''}`}
                        onClick={() => handleFilterType('aporte')}
                    >
                        Aportes
                    </button>
                    <button
                        className={`filter-btn ${filters.filterType === 'retiro' ? 'active' : ''}`}
                        onClick={() => handleFilterType('retiro')}
                    >
                        Retiros
                    </button>
                </div>
            </div>

            {/* Vista escritorio */}
            <div className="table-container desktop-view">
                {historial.length === 0 ? (
                    <div className="empty-state">
                        <p>No hay movimientos que coincidan con los filtros</p>
                    </div>
                ) : (
                    <table className="retiros-table">
                        <thead>
                            <tr>
                                <th>Cuenta</th>
                                <th>Descripción</th>
                                <th>Importe</th>
                                <th>Fecha</th>
                            </tr>
                        </thead>
                        <tbody>
                            {historial.map((mov) => (
                                <tr key={mov._id}>
                                    <td>{mov.account || mov.withdrawAccount}</td>
                                    <td>{mov.descripcion}</td>
                                    <td>
                                        <NumericFormat
                                            value={mov.amount}
                                            displayType="text"
                                            thousandSeparator="."
                                            decimalSeparator=","
                                            prefix="$"
                                        />
                                    </td>
                                    <td>{new Date(mov.createdAt).toLocaleString('es-AR', { hour12: false })}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>

            {/* Vista móvil */}
            <div className="mobile-view">
                {historial.length === 0 ? (
                    <div className="empty-state">
                        <p>No hay movimientos que coincidan con los filtros</p>
                    </div>
                ) : (
                    <div className="cards-container">
                        {historial.map((mov) => (
                            <div key={mov._id} className="withdraw-card">
                                <div className="card-header">
                                    <div className="user-info">
                                        <h3 className="card-user-name">
                                            {mov.account || mov.withdrawAccount}
                                        </h3>
                                        <p className="card-user-alias">{mov.descripcion}</p>
                                    </div>
                                    <div className="card-amount">
                                        <NumericFormat
                                            value={mov.amount}
                                            displayType="text"
                                            thousandSeparator="."
                                            decimalSeparator=","
                                            prefix="$"
                                        />
                                    </div>
                                    <div className="card-dates">
                                        <p>
                                            <strong>Fecha:</strong>{' '}
                                            {new Date(mov.createdAt).toLocaleString('es-AR', { hour12: false })}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Paginación */}
            <div className="pagination">
                <button
                    disabled={filters.page <= 1}
                    onClick={() => handlePageChange(filters.page - 1)}
                >
                    ←
                </button>
                <span>
                    {filters.page} / {pages}
                </span>
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