import { useState, useContext } from "react";
import { Link } from "react-router-dom";
import { deposit as depositAPI } from "../services/auth";
import { AuthContext } from '../context/AuthContext';
import { toast, ToastContainer } from 'react-toastify';
import { NumericFormat } from 'react-number-format';
import 'react-toastify/dist/ReactToastify.css';

function DepositPage() {
    const [name, setName] = useState("");
    const [amount, setAmount] = useState(""); // Almacena valor como string para formateo
    const { user } = useContext(AuthContext);
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            setLoading(true);

            // Convertir a número limpio (sin comas)
            const numericAmount = parseFloat(amount.toString().replace(/,/g, ""));

            const res = await depositAPI({ name: user.name, amount: numericAmount });
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
        const textToCopy = 'roberpay2';
        if (navigator.clipboard) {
            navigator.clipboard.writeText(textToCopy)
                .then(() => toast.success("Alias copiado al portapapeles!"))
                .catch(() => toast.error("Error al copiar al portapapeles"));
        } else {
            const textArea = document.createElement('textarea');
            textArea.style.position = 'absolute';
            textArea.style.left = '-9999px';
            textArea.value = textToCopy;
            document.body.appendChild(textArea);
            textArea.select();
            try {
                document.execCommand('copy');
                toast.success("Alias copiado al portapapeles!");
            } catch {
                toast.error("Error al copiar al portapapeles");
            }
            document.body.removeChild(textArea);
        }
    };

    return (
        <>
            <form onSubmit={handleSubmit}>

                <Link to="/" className="back-button">🔙</Link>

                <h1>CARGA</h1>
                <p>🏦 Realice la transferencia a la siguiente cuenta</p>
                <p className="copy-alias" onClick={handleCopy}>👤 TITULAR: Roberto Flores</p>
                <p className="copy-alias" onClick={handleCopy}>
                    🔗 ALIAS: roberpay2
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