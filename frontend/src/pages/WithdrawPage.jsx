import { useState, useContext, useEffect, useCallback, useMemo } from "react";
import { Link } from "react-router-dom";
import { withdraw as withdrawAPI } from "../services/auth";
import { AuthContext } from '../context/AuthContext';
import { SocketContext } from "../context/SocketContext";
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { FaArrowLeft } from 'react-icons/fa';

export default function WithdrawPage() {
    const { user, addAcount } = useContext(AuthContext);
    const socket = useContext(SocketContext);

    const [amount, setAmount] = useState("");
    const [account, setAccount] = useState("");
    const [loading, setLoading] = useState(false);
    const [newAccount, setNewAccount] = useState("");

    const reversedAccounts = useMemo(
        () => user.accounts.slice().reverse(),
        [user.accounts]
    );

    useEffect(() => {
        if (!account && reversedAccounts.length > 0) {
            setAccount(reversedAccounts[0].name);
        }
    }, [reversedAccounts, account]);

    const handleWithdraw = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const res = await withdrawAPI({ name: user.name, amount, account });
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
            const res = await addAcount(newAccount);
            toast.success(res.message || "Alias agregado correctamente");
            setNewAccount("");
        } catch (err) {
            toast.error(err.message || "Error al agregar alias");
        } finally {
            setLoading(false);
        }
    }, [newAccount, addAcount]);

    const handleAlias = (e) => {
        e.preventDefault();
        socket.emit(
            "verify",
            user.name,
            user.phone,
            "new-account",
            (res) => {
                if (res.ok) {
                    toast.success(res.msg);
                } else {
                    toast.error(res.msg);
                }
            }
        );
    };

    useEffect(() => {
        const onVerified = (res) => {
            if (res.ok) {
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

    return (
        <>
            <form onSubmit={handleWithdraw} className="form">
                <div className="form-header">
                  <Link to="/" className="circle-back-button" title="Volver al inicio">
                    <FaArrowLeft />
                  </Link>
                  <h1 className="page-title">RETIRO</h1>
                </div>
                <input
                    type="number"
                    placeholder="Importe"
                    className="input"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    required
                />
                <select
                    name="account"
                    className="input"
                    value={account}
                    onChange={(e) => setAccount(e.target.value)}
                >
                    {reversedAccounts.map((acc, index) => (
                        <option key={index} value={acc.name}>
                            {acc.name}
                        </option>
                    ))}
                </select>
                <div className="btn-group">
                    <button type="submit" className="btn" disabled={loading}>
                        {loading ? "Retirando..." : "Retirar"}
                    </button>
                </div>
            </form>

            <form onSubmit={handleAlias} className="form">
                <h1>Agregar Alias</h1>
                <input
                    type="text"
                    placeholder="Alias"
                    className="input"
                    value={newAccount}
                    onChange={(e) => setNewAccount(e.target.value)}
                    required
                />
                <button type="submit" className="btn" disabled={loading}>
                    {loading ? "Agregando..." : "Agregar Alias"}
                </button>
            </form>

            <ToastContainer />
        </>
    );
}