// src/pages/RegisterPage.jsx
import { useContext, useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { SocketContext } from "../context/SocketContext";
import { register as registerAPI } from "../services/auth";

export default function RegisterPage() {
    const [name, setName] = useState("");
    const [phone, setPhone] = useState("");
    const [verified, setVerified] = useState(false);

    const socket = useContext(SocketContext);

    // 1) Función única que hace la llamada a la API,
    // guarda el token y redirige
    const handleRegister = useCallback(async () => {
        try {
            const formattedPhone = `549${phone}@c.us`;
            const res = await registerAPI({ name, phone: formattedPhone });
            const { token } = res.data;
            localStorage.setItem("token", token);
            window.location.href = '/'; // Redirige a la página principal
        } catch (error) {
            alert(
                "Error al registrarse: " +
                (error.response?.data?.error || error.message)
            );
        }
    }, [name, phone]);

    // 2) Al pulsar “Ingresar”
    const ingresar = async (e) => {
        e.preventDefault();

        // Si no está validado, llamo directo al registro
        if (verified) {
            await handleRegister();
            return;
        }

        // Si ya está validado, emito el evento
        socket.emit("verify", name, `549${phone}@c.us`, (res) => {
            if (res.ok) {
                setVerified(true);
                alert(res.msg);
            } else {
                alert(res.msg);
            }
        });
    };

    // 3) Escucho el evento del socket y reutilizo handleRegister
    useEffect(() => {
        const onVerified = (res) => {
            if (res.ok) {
                handleRegister();
            } else {
                alert(res.msg);
            }
        };

        socket.on("verified", onVerified);
        return () => {
            socket.off("verified", onVerified);
        };
    }, [socket, handleRegister]);

    return (
        <form onSubmit={ingresar}>
            <h1>Registro</h1>

            <input
                className="input"
                type="text"
                placeholder="Nombre de usuario"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
            />

            <div className="input-group">
                <input
                    className="input"
                    type="tel"
                    placeholder="Celular"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    required
                    disabled={verified}
                />
            </div>

            <div className="btn-group">
                <Link to="/" className="btn">
                    Regresar
                </Link>
                <button className="btn" type="submit">
                    Ingresar
                </button>
            </div>
        </form>
    );
}
