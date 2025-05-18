// src/pages/WithdrawPage.jsx
import { useState, useContext, useEffect, useCallback, useMemo } from "react";
import { Link } from "react-router-dom";
import { withdraw as withdrawAPI } from "../services/auth";
import { AuthContext } from '../context/AuthContext';
import Spinner from "../components/Spinner";
import { SocketContext } from "../context/SocketContext";

export default function WithdrawPage() {
    const { user, addAcount } = useContext(AuthContext);
    const socket = useContext(SocketContext);

    const [amount, setAmount] = useState("");
    const [account, setAccount] = useState("");
    const [loading, setLoading] = useState(false);
    const [newAccount, setNewAccount] = useState("");

    // Invertir el orden para que el último agregado salga primero
    const reversedAccounts = useMemo(
        () => user.accounts.slice().reverse(),
        [user.accounts]
    );

    // Inicializar account con la primera cuenta válida
    useEffect(() => {
        if (!account && reversedAccounts.length > 0) {
            setAccount(reversedAccounts[0].name);
        }
    }, [reversedAccounts, account]);

    // Maneja el retiro
    const handleWithdraw = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const res = await withdrawAPI({ name: user.name, amount, account });
            alert(res.data.message);
            setAmount("");
            setAccount("");
        } catch (error) {
            const errMsg = error.response?.data?.error || "Error interno del servidor";
            alert(errMsg);
        } finally {
            setLoading(false);
        }
    };

    // Añade nueva cuenta tras verificación
    const handleNewAccount = useCallback(async () => {
        setLoading(true);
        try {
            const res = await addAcount(newAccount);
            alert(res.data.message);
            setNewAccount("");
            // account se inicializará al detectarse el cambio en user.accounts
        } catch (err) {
            alert(err.message);
        } finally {
            setLoading(false);
        }
    }, [newAccount, addAcount]);

    // Dispara verificación vía socket
    const handleAlias = (e) => {
        e.preventDefault();
        socket.emit(
            "verify",
            user.name,
            user.phone,
            "new-account",
            (res) => {
                alert(res.msg);
            }
        );
    };

    // Escucha el evento 'verified' y, si ok, ejecuta handleNewAccount
    useEffect(() => {
        const onVerified = (res) => {
            if (res.ok) {
                handleNewAccount();
            } else {
                alert(res.msg);
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
                <h1>Retiro</h1>
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
                    <Link to="/" className="btn">Regresar</Link>
                    <button type="submit" className="btn" disabled={loading}>
                        {loading ? <Spinner /> : "Retirar"}
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
                    {loading ? <Spinner /> : "Agregar Alias"}
                </button>
            </form>
        </>
    );
}