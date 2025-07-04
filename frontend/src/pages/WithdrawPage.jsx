import { useState, useContext, useEffect, useCallback, useMemo } from "react";
import { Link } from "react-router-dom";
import { withdraw as withdrawAPI, getMyWithdraws, deleteMyWithdraw } from "../services/auth";
import { AuthContext } from '../context/AuthContext';
import { NumericFormat } from 'react-number-format';
import { SocketContext } from "../context/SocketContext";
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { FaArrowLeft, FaPlus, FaTimes } from 'react-icons/fa';

export default function WithdrawPage() {
    const { user, newUserAccount } = useContext(AuthContext);
    const socket = useContext(SocketContext);

    const [amount, setAmount] = useState("");
    const [account, setAccount] = useState("");
    const [loading, setLoading] = useState(false);
    const [newAccount, setNewAccount] = useState("");
    const [showAddAlias, setShowAddAlias] = useState(false);

    const [cancelingIds, setCancelingIds] = useState(new Set());
    const [myWithdraws, setMyWithdraws] = useState([]);

    const reversedAccounts = useMemo(() => {
        return [...user.accounts].reverse();
    }, [user.accounts]);

    useEffect(() => {
        if (reversedAccounts.length > 0 && !account) {
            setAccount(reversedAccounts[0].name);
        }
    }, [reversedAccounts, account]);

    useEffect(() => {
        const fetchMyWithdraws = async () => {
            try {
                const res = await getMyWithdraws(user.name);
                setMyWithdraws(res.data.withdraws);
            } catch (err) {
                console.error('Error al cargar retiros del usuario:', err);
            }
        };
        fetchMyWithdraws();
    }, [user.name]);

    const handleWithdraw = async (e) => {
        e.preventDefault();

        const parsedAmount = parseFloat(amount);
        if (isNaN(parsedAmount) || parsedAmount <= 0) {
            toast.error("El importe debe ser mayor a 0.");
            return;
        }

        setLoading(true);
        try {
            const res = await withdrawAPI({ name: user.name, amount, account, phone: user.phone });
            toast.success(res.data.message || "Retiro realizado correctamente");
            setAmount("");
            setAccount("");
        } catch (error) {
            const errMsg = error.response?.data?.error || "Error interno del servidor";
            toast.error(errMsg);
        } finally {
            setLoading(false);
        }
    };

    const handleNewAccount = useCallback(async () => {
        setLoading(true);
        try {
            const res = await newUserAccount(newAccount);
            toast.success(res.message || "Alias agregado correctamente");
            // 🟢 Establecer como alias seleccionado actual
            setAccount(newAccount);
            setNewAccount("");
            setShowAddAlias(false);
        } catch (err) {
            toast.error(err.message || "Error al agregar alias");
        } finally {
            setLoading(false);
        }
    }, [newAccount, newUserAccount]);

    const handleAlias = (e) => {
        e.preventDefault();
        socket.emit(
            "verify",
            user.name,
            user.phone,
            "new-account",
            newAccount,
            (res) => {
                if (res.ok) {
                    toast.success(res.msg);
                } else {
                    toast.error(res.msg);
                }
            },
        );
    };

    useEffect(() => {
        const onVerified = (res) => {
            if (res.ok) {
                socket.emit("received-verified");
                handleNewAccount();
            } else {
                toast.error(res.msg);
            }
        };
        socket.on("verified", onVerified);
        return () => {
            socket.off("verified", onVerified);
        };
    }, [socket, handleNewAccount]);

    const toggleAddAlias = () => {
        setShowAddAlias(!showAddAlias);
        if (!showAddAlias) {
            setNewAccount("");
        }
    };

    const handleCancel = async (withdrawId) => {
        if (!window.confirm("¿Estás seguro de que querés cancelar este retiro?")) return;

        setCancelingIds(prev => new Set(prev).add(withdrawId));

        try {
            const res = await deleteMyWithdraw(withdrawId);
            toast.success(res.data.message || "Retiro cancelado correctamente");

            // Recargar retiros actualizados
            const updated = await getMyWithdraws(user.name);
            setMyWithdraws(updated.data.withdraws);
        } catch (err) {
            const msg = err.response?.data?.error || "Error al cancelar el retiro";
            toast.error(msg);
            console.error("Error en handleCancel:", err);
        } finally {
            setCancelingIds(prev => {
                const newSet = new Set(prev);
                newSet.delete(withdrawId);
                return newSet;
            });
        }
    };

    return (
        <>
            <form onSubmit={handleWithdraw}>
                <div className="form-header">
                    <Link to="/" className="circle-back-button" title="Volver al inicio">
                        <FaArrowLeft />
                    </Link>
                    <h1 className="page-title">RETIRO</h1>
                </div>
                <NumericFormat
                    value={amount}
                    onValueChange={(values) => setAmount(values.value)}
                    thousandSeparator="."
                    decimalSeparator=","
                    allowNegative={false}
                    placeholder="Importe a retirar"
                    className="input"
                    prefix="$"
                    allowLeadingZeros={false}
                    isAllowed={(values) => {
                        const { floatValue } = values;
                        return floatValue === undefined || floatValue > 0;
                    }}
                    required
                />
                <div className="account-selector">
                    <div className="select-wrapper">
                        <select
                            name="account"
                            className="input account-select"
                            value={account}
                            onChange={(e) => setAccount(e.target.value)}
                            required
                        >
                            <option value="">Seleccionar cuenta</option>
                            {reversedAccounts.map((acc, index) => (
                                <option key={index} value={acc.name}>
                                    {acc.name}
                                </option>
                            ))}
                        </select>
                    </div>
                    <button
                        type="button"
                        className="add-account-btn"
                        onClick={toggleAddAlias}
                        title="Agregar nuevo alias"
                    >
                        {showAddAlias ? <FaTimes /> : <FaPlus />}
                    </button>
                </div>

                {showAddAlias && (
                    <div className="add-account-section">
                        <input
                            type="text"
                            placeholder="Ingrese el nuevo alias"
                            className="input"
                            value={newAccount}
                            onChange={(e) => setNewAccount(e.target.value)}
                            required
                        />
                        <button
                            type="button"
                            onClick={handleAlias}
                            className="btn add-btn"
                            disabled={loading || !newAccount.trim()}
                        >
                            {loading ? "Agregando..." : "Agregar Alias"}
                        </button>
                    </div>
                )}

                <div className="btn-group">
                    <button
                        type="submit"
                        className={`btn ${loading ? "gray" : ""}`}
                        disabled={loading || !amount || !account}
                    >
                        {loading ? "Procesando..." : "Realizar Retiro"}
                    </button>
                </div>
            </form>

            <table className="withdraw-table">
                <thead>
                    <tr>
                        <th>CUENTA</th>
                        <th>IMPORTE</th>
                        <th>ACCIÓN</th>
                    </tr>
                </thead>
                <tbody>
                    {myWithdraws.length === 0 ? (
                        <tr>
                            <td colSpan="3" style={{ textAlign: 'center', padding: '10px' }}>
                                No tenés retiros realizados aún.
                            </td>
                        </tr>
                    ) : (
                        myWithdraws.map((w, idx) => (
                            <tr key={idx}>
                                <td>{w.account}</td>
                                <td>
                                    <NumericFormat
                                        value={w.amount}
                                        displayType="text"
                                        thousandSeparator="."
                                        decimalSeparator=","
                                        prefix="$"
                                    />
                                </td>
                                <td>
                                    {!w.state ? (
                                        <button
                                            className="btn-cancelar"
                                            onClick={() => handleCancel(w._id)}
                                            disabled={cancelingIds.has(w._id)}
                                            style={{
                                                opacity: cancelingIds.has(w._id) ? 0.6 : 1,
                                                cursor: cancelingIds.has(w._id) ? 'not-allowed' : 'pointer'
                                            }}
                                        >
                                            {cancelingIds.has(w._id) ? "Cancelando..." : "Cancelar"}
                                        </button>
                                    ) : (
                                        <span style={{ opacity: 0.6 }}>Completado</span>
                                    )}
                                </td>
                            </tr>
                        ))
                    )}
                </tbody>
            </table>


            <ToastContainer />
        </>
    );
}