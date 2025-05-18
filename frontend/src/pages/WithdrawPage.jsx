import { useState, useContext } from "react";
import { Link } from "react-router-dom";
import { withdraw as withdrawAPI } from "../services/auth";
import { AuthContext } from '../context/AuthContext';
import Spinner from "../components/Spinner";

function WithdrawPage() {

    const { user } = useContext(AuthContext);
    const [amount, setAmount] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            // Si es 2xx, entra aquí
            setLoading(true);
            const res = await withdrawAPI({ name: user.name, amount });
            // El back devuelve: { message: 'Retiro cargado correctamente' }
            alert(res.data.message);
        } catch (error) {
            // Aquí caen los 400 (‘error’ y ‘insufficient’) y 500
            const errMsg = error.response?.data?.error;
            if (errMsg) {
                alert(errMsg); //‘No tiene esa cantidad de fichas’ o ‘Error al cargar el depósito’
            } else {
                alert("Error interno del servidor");
            }
        } finally {
            setLoading(false);
        }
    }

    return (
        <form onSubmit={handleSubmit} className="form">
            <h1>Retiro</h1>
            <input onChange={e => setAmount(e.target.value)} value={amount} className="input" type="number" placeholder="Importe" required />
            <div className="btn-group">
                <Link to="/" className="btn">Regresar</Link>
                <button className="btn" type="submit" disabled={loading}>{loading ? <Spinner /> : 'Retirar'} </button>
            </div>
        </form>
    )
}

export default WithdrawPage;