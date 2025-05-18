import { useState, useContext } from "react";
import { Link } from "react-router-dom";
import { deposit as depositAPI } from "../services/auth";
import { AuthContext } from '../context/AuthContext';
import Spinner from "../components/Spinner";

function DepositPage() {

    const [name, setName] = useState("");
    const [amount, setAmount] = useState("");
    const { user } = useContext(AuthContext);
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            // Si es 2xx, entra aquí
            setLoading(true);
            const res = await depositAPI({ name: user.name, amount });
            // El back devuelve: { message: 'Depósito cargado correctamente' }
            alert(res.data.message);
            setName("");
            setAmount("");
        } catch (error) {
            // Aquí caen los 400 (‘error’ y ‘insufficient’) y 500
            const errMsg = error.response?.data?.error;
            if (errMsg) {
                alert(errMsg); // ‘No tiene esa cantidad de fichas’ o ‘Error al cargar el depósito’
            } else {
                alert("Error interno del servidor");
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit}>
            <h1>Carga</h1>

            <p>PASO 1:</p>
            <p>Realice una transferencia a la siguiente cuenta:</p>
            <p>Cuenta: Roberto Flores</p>
            <p>Alias: roberpay2</p>
            <p>PASO 2:</p>
            <p>Complete los siguientes datos:</p>

            <input
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="input"
                type="number"
                placeholder="Importe transferido"
                required
            />
            <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="input"
                type="text"
                placeholder="Nombre completo del titular de la cuenta"
                required
            />

            <div className="btn-group">
                <Link to="/" className="btn">Regresar</Link>
                <button className="btn" type="submit" disabled={loading}>{loading ? <Spinner /> : 'Cargar'} </button>
            </div>
        </form>
    );
}

export default DepositPage;