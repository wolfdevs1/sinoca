import { useEffect, useState, useContext } from 'react';
import { getAllUsers, getWithdraws, getAccounts, addNewAccount, deleteAccount as deleteAccountAPI, changeWithdrawState as changeWithdrawStateAPI } from '../services/auth';
import { AuthContext } from '../context/AuthContext';

export default function AdminPage() {
    const [users, setUsers] = useState([]);
    const [withdraws, setWithdraws] = useState([]);
    const [accounts, setAccounts] = useState([]);
    const { logout } = useContext(AuthContext);
    const [newAccount, setNewAccount] = useState({
        alias: '',
        name: '',
        state: false,
    });

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const { data } = await getAllUsers();
                setUsers(data);
            } catch (err) {
                console.error('Error al obtener usuarios:', err);
            }
        };

        const fetchWithdraws = async () => {
            try {
                const { data } = await getWithdraws();
                setWithdraws(data);
            } catch (err) {
                console.error('Error al obtener retiros:', err);
            }
        };

        const fetchAccounts = async () => {
            try {
                const { data } = await getAccounts();
                setAccounts(data);
            } catch (err) {
                console.error('Error al obtener cuentas:', err);
            }
        };

        fetchWithdraws();
        fetchUsers();
        fetchAccounts();
    }, []);

    // Actualiza el estado de newAccount cuando los campos de los inputs cambian
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setNewAccount((prev) => ({
            ...prev,
            [name]: value
        }));
    };

    const handleAddAccount = async () => {
        try {
            const res = await addNewAccount(newAccount);
            console.log(res.data);

            // Volver a cargar cuentas actualizadas
            const updated = await getAccounts();
            setAccounts(updated.data);

            // Limpiar los campos
            setNewAccount({ alias: '', name: '' });
        } catch (err) {
            console.error("Error al agregar cuenta:", err);
        }
    };

    const deleteAccount = async id => {
        try {
            const res = await deleteAccountAPI({ id });
            console.log(res.data);

            // Volver a cargar cuentas actualizadas
            const updated = await getAccounts();
            setAccounts(updated.data);

            // Limpiar los campos
            setNewAccount({ alias: '', name: '' });
        } catch (error) {
            console.error("Error al borrar la cuenta:", err);
        }
    };

    const changeWithdrawState = async (value, id) => {
        try {
            const res = await changeWithdrawStateAPI({ id, value });
            console.log(res.data);

            // Volver a cargar cuentas actualizadas
            const updated = await getAccounts();
            setAccounts(updated.data);

            // Limpiar los campos
            setNewAccount({ alias: '', name: '', state: false });
        } catch (error) {
            console.error("Error al borrar la cuenta:", err);
        }
    };

    return (
        <div className="admin-container">
            <header>
                <h2>Panel de Administrador</h2>
            </header>
            <section>
                <h3>Lista de usuarios</h3>
                <ul>
                    {users?.map(u => (
                        <li key={u._id}>
                            <strong>{u.name}</strong> — {u.phone} ({u.role})
                        </li>
                    ))}
                </ul>
            </section>
            <section>
                <h3>Retiros</h3>
                <ul>
                    {withdraws?.map(u => (
                        <li key={u._id}>
                            <strong>{u.account}</strong> — {u.amount}
                            <input checked={u.state} onChange={(e) => changeWithdrawState(e.target.checked, u._id)} type="checkbox" />
                        </li>
                    ))}
                </ul>
            </section>
            <section>
                <h3>Cuentas</h3>
                <ul>
                    {accounts?.map(u => (
                        <li key={u._id}>
                            <strong>{u.name}</strong> — {u.alias}
                            <span onClick={() => deleteAccount(u._id)}> BORRAR</span>
                        </li>
                    ))}
                </ul>
            </section>
            <div>
                <input
                    name="alias"  // Le asignamos el nombre para que el estado se actualice correctamente
                    value={newAccount.alias}  // Vinculamos el valor con el estado
                    placeholder='ALIAS'
                    type="text"
                    onChange={handleInputChange}  // Manejamos el cambio de estado
                />
                <input
                    name="name"  // Le asignamos el nombre para que el estado se actualice correctamente
                    value={newAccount.name}  // Vinculamos el valor con el estado
                    placeholder='TITULAR'
                    type="text"
                    onChange={handleInputChange}  // Manejamos el cambio de estado
                />
                <button onClick={handleAddAccount}>AGREGAR CUENTA</button>
            </div>
        </div>
    );
}
