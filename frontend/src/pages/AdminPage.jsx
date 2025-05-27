import { useEffect, useState, useContext } from 'react';
import { getWithdraws, changeWithdrawState as changeWithdrawStateAPI } from '../services/auth';
import { AuthContext } from '../context/AuthContext';

export default function AdminPage() {
    const [withdraws, setWithdraws] = useState([]);
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

    return (
        <div className="admin-container">
            <header>
                <h2>Panel de Retiros</h2>
            </header>
            <section>
                <h3>Retiros</h3>
                <ul>
                    {withdraws?.map(w => (
                        <li key={w._id}>
                            <strong>{w.name}</strong> — {w.phone}<br />
                            Cuenta: {w.account}<br />
                            Monto: {w.amount}<br />
                            Estado:
                            <input
                                type="checkbox"
                                checked={w.state}
                                onChange={(e) => changeWithdrawState(e.target.checked, w._id)}
                            />
                        </li>
                    ))}
                </ul>
            </section>
        </div>
    );
};