import { Link } from "react-router-dom";
import { useState } from "react";
import { socket } from "../main";

function Retiro({ usuario }) {

    const [importe, setImporte] = useState("");
    const [celular, setCelular] = useState("");

    const handleSubmit = (e) => {
        e.preventDefault();

        socket.emit('retiro', { usuario, importe, celular }, (response) => {
            if (response.status === 'ok') {
                alert('Retiro realizado con éxito');
            } else if (response.status === 'faltante') {
                alert('No hay saldo suficiente para realizar el retiro');
            } else if (response.status === 'error') {
                alert('Error al realizar el retiro');
            } else {
                alert('Error desconocido');
            }
        });
    }

    return (
        <form onSubmit={handleSubmit} className="form">
            <h1>Retiro</h1>
            <input onChange={e => setImporte(e.target.value)} value={importe} className="input" type="number" placeholder="Importe" required />

            <div className="input-group">
                <input className="input input-codArea" type="tel" placeholder="Cod. Área" required />
                <input className="input input-celular" type="tel" placeholder="Celular" required />
                <button className="btn btn-validate" type="button">Validar</button>
            </div>
            <div className="btn-group">
                <Link to="/panel" className="btn">Regresar</Link>
                <button className="btn" type="submit">Retirar</button>
            </div>
        </form>
    )
}

export default Retiro;