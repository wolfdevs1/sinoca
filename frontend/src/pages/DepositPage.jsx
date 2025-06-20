import { useState, useContext, useEffect } from "react";
import { Link } from "react-router-dom";
import { deposit as depositAPI, getRandomAccount } from "../services/auth";
import { AuthContext } from '../context/AuthContext';
import { toast, ToastContainer } from 'react-toastify';
import { NumericFormat } from 'react-number-format';
import 'react-toastify/dist/ReactToastify.css';
import { FaArrowLeft } from 'react-icons/fa';



function DepositPage() {
    const [name, setName] = useState("");
    const [amount, setAmount] = useState(""); // Almacena valor como string para formateo
    const { user } = useContext(AuthContext);
    const [loading, setLoading] = useState(false);
    const [randomAccount, setRandomAccount] = useState(null);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            setLoading(true);

            // Convertir a número limpio (sin comas)
            const numericAmount = parseFloat(amount.toString().replace(/,/g, "")).toString();

            const res = await depositAPI({ user, amount: numericAmount });
            toast.success(res.data.message);
            setName("");
            setAmount("");
        } catch (error) {
            const errMsg = error.response?.data?.error;
            toast.error(errMsg || "Error interno del servidor");
        } finally {
            setLoading(false);
        }
    };

    const handleCopy = () => {
        const textToCopy = randomAccount.alias;
        const toastId = 'alias-copy-toast'; // Un ID único para el toast

        // Escribir el alias al portapapeles
        if (navigator.clipboard) {
            navigator.clipboard.writeText(textToCopy)
                .then(() => {
                    // Si ya existe el toast con este ID, se actualiza
                    toast.success("Alias copiado al portapapeles!", {
                        toastId,  // Usar el mismo ID para reemplazar el anterior
                        autoClose: 2000, // Opcional: tiempo de cierre
                    });
                })
                .catch(() => {
                    toast.error("Error al copiar al portapapeles", {
                        toastId,  // Usar el mismo ID para reemplazar el anterior
                        autoClose: 3000, // Opcional: tiempo de cierre
                    });
                });
        } else {
            // Si no se puede usar clipboard API
            const textArea = document.createElement('textarea');
            textArea.style.position = 'absolute';
            textArea.style.left = '-9999px';
            textArea.value = textToCopy;
            document.body.appendChild(textArea);
            textArea.select();
            try {
                document.execCommand('copy');
                toast.success("Alias copiado al portapapeles!", {
                    toastId,  // Usar el mismo ID para reemplazar el anterior
                    autoClose: 2000, // Opcional: tiempo de cierre
                });
            } catch {
                toast.error("Error al copiar al portapapeles", {
                    toastId,  // Usar el mismo ID para reemplazar el anterior
                    autoClose: 3000, // Opcional: tiempo de cierre
                });
            }
            document.body.removeChild(textArea);
        }
    };

    useEffect(() => {
        const fetchRandomAccount = async () => {
            try {
                // Asume que axios ya usa el baseURL y el header Authorization con el token
                const { data } = await getRandomAccount();
                setRandomAccount(data);

            } catch (err) {
                console.error('Error al obtener usuarios:', err);
            }
        }
        fetchRandomAccount();
    }, []);

    return (
        <>
            <form onSubmit={handleSubmit}>

                <div className="form-header">
                    <Link to="/" className="circle-back-button" title="Volver al inicio">
                        <FaArrowLeft />
                    </Link>
                    <h1 className="page-title">CARGA</h1>
                </div>


                <p>🏦 Realice la transferencia a la siguiente cuenta</p>
                <p className="copy-alias" onClick={handleCopy}>
                    👤 TITULAR: {randomAccount ? randomAccount.name : 'Cargando...'}
                </p>
                <p className="copy-alias" onClick={handleCopy}>
                    🔗 ALIAS: {randomAccount ? randomAccount.alias : 'Cargando...'}
                    <span className="copy-icon" title="Copiar alias">📌</span>
                </p>
                <p className="warning">⚠️ El ALIAS puede cambiar con el tiempo ⚠️</p>
                <p>Una vez realizada la transferencia, complete los siguientes datos 👇👇👇</p>

                <NumericFormat
                    value={amount}
                    onValueChange={(values) => {
                        setAmount(values.value); // values.value es el valor sin formato
                    }}
                    prefix="$ "
                    thousandSeparator="."
                    decimalSeparator=","
                    allowNegative={false}
                    className="input"
                    placeholder="Importe transferido"
                    required
                />

                <input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="input"
                    type="text"
                    placeholder="Titular de la cuenta"
                    required
                />

                <div className="btn-group">
                    <button
                        className={`btn ${loading ? "gray" : ""}`}
                        type="submit"
                        disabled={loading}
                    >
                        {loading ? "Cargando..." : "Cargar"}
                    </button>
                </div>
            </form>
            <ToastContainer />
        </>
    );
}

export default DepositPage;