import { useState } from "react";
import { Link } from "react-router-dom";
import { socket } from "../main";

function Carga({ usuario }) {

    const [importe, setImporte] = useState("");
    const [nombre, setNombre] = useState("");

    const handleSubmit = (e) => {
        e.preventDefault();

        socket.emit("cargar", { usuario, importe, nombre }, (res) => {
            if (res.status === "ok") {
                alert("Carga realizada con éxito.");
            } else {
                alert(res.message);
            }
        });
    }

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
                value={importe}
                onChange={(e) => setImporte(e.target.value)}
                className="input"
                type="number"
                placeholder="Importe transferido"
                required
            />
            <input
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                className="input"
                type="text"
                placeholder="Nombre completo del titular de la cuenta"
                required
            />

            <div className="btn-group">
                <Link to="/panel" className="btn">Regresar</Link>
                <button className="btn" type="submit">Cargar</button>
            </div>
        </form>
    );
}

export default Carga;
