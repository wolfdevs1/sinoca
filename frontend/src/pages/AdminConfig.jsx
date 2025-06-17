import { useContext, useEffect, useState } from "react";
import { SocketContext } from "../context/SocketContext";
import { QRCodeCanvas } from "qrcode.react";

export default function AdminConfig() {
    const socket = useContext(SocketContext);
    const [qrText, setQrText] = useState(null);
    const [status, setStatus] = useState('');
    const [authorized, setAuthorized] = useState(false);

    useEffect(() => {
        const storedAccess = localStorage.getItem("adminAccess");
        if (storedAccess === "true") {
            setAuthorized(true);
        } else {
            const pass = window.prompt("🔐 Ingresá la clave de administrador");
            if (pass === "admin123") {
                localStorage.setItem("adminAccess", "true");
                setAuthorized(true);
            } else {
                setStatus("❌ Acceso denegado");
            }
        }
    }, []);

    useEffect(() => {
        if (!authorized) return;

        socket.on("qr", (qr) => {
            setStatus("📲 Escaneá el código QR");
            setQrText(qr);
        });

        socket.on("ready", () => {
            setStatus("✅ WhatsApp conectado");
            setQrText(null);
        });

        socket.on("disconnected", (msg) => {
            setStatus(msg);
            setQrText(null);
        });

        socket.emit('request-status');

        return () => {
            socket.off("qr");
            socket.off("ready");
            socket.off("disconnected");
        };
    }, [authorized, socket]);

    const handleStart = () => {
        if (!qrText) {
            setStatus("🕓 Esperando código QR...");
            socket.emit("start-whatsapp");
        }
    };

    const handleStop = () => {
        socket.emit("stop-whatsapp");
    };

    const handleClearSession = () => {
        socket.emit("clear-session");
    };

    if (!authorized) {
        return (
            <div className="admin-container">
                <div className="card">
                    <h2 className="titulo-profesional">{status}</h2>
                </div>
            </div>
        );
    }

    return (
        <div className="admin-container">
            <div className="card">
                <h1 className="titulo-profesional">Conectar WhatsApp</h1>

                {qrText && (
                    <div style={{ margin: "20px auto", background: "white", padding: 12, borderRadius: 8, width: "fit-content" }}>
                        <QRCodeCanvas value={qrText} size={300} />
                    </div>
                )}

                <p style={{ textAlign: 'center', marginTop: '15px' }} className="subtitulo-profesional">{status}</p>

                <div className="btn-group-panel" style={{ marginTop: 30 }}>
                    <button className="btn" onClick={handleStart}>Iniciar WhatsApp</button>
                    <button className="btn" onClick={handleStop}>Apagar WhatsApp</button>
                    <button className="btn" onClick={handleClearSession}>Borrar sesión</button>
                </div>
            </div>
        </div>
    );
}
