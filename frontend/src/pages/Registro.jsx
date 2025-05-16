import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { socket } from "../main";

function Registro() {
    const [usuario, setUsuario] = useState("");
    const [telefono, setTelefono] = useState("");
    const [validado, setValidado] = useState(false);

    const ingresar = () => {
        if (validado) {
            socket.emit('crear-usuario', usuario, `549${telefono}@c.us`);
        } else {
            socket.emit('validar-telefono-y-crear-usuario', usuario, `549${telefono}@c.us`, (response) => {
                console.log(response);
            });
        }
    };

    const handleUsuarioRespuesta = (res) => {
        switch (res.status) {
            case 'error':
                // Aquí podrías mostrar un toast, alerta, etc.
                alert(res.message);
                console.error(res.message);
                return;
            case 'taken':
                // Notificar que el usuario ya existe
                alert(res.message);
                console.warn(res.message);
                return;
            case 'ok':
                // Guardar en localStorage y redirigir
                localStorage.setItem('id', res.mongoId);
                window.location.href = '/panel';
                return;
            default:
                console.error('Status de respuesta desconocido:', res);
        }
    };

    useEffect(() => {
        // Listener para la verificación del teléfono
        socket.on('telefono-verificado', () => {
            setValidado(true);
        });

        // Listener único para todos los outcomes de creación de usuario
        socket.on('usuario-respuesta', handleUsuarioRespuesta);

        return () => {
            socket.off('telefono-verificado');
            socket.off('usuario-respuesta', handleUsuarioRespuesta);
        };
    }, []);

    return (
        <form onSubmit={(e) => e.preventDefault()}>
            <h1>Registro</h1>
            <input
                className="input"
                type="text"
                placeholder="Nombre de usuario"
                value={usuario}
                onChange={(e) => setUsuario(e.target.value)}
                required
            />
            <div className="input-group">
                <input
                    className="input"
                    type="tel"
                    placeholder="Celular"
                    value={telefono}
                    onChange={(e) => setTelefono(e.target.value)}
                    required
                />
                {
                    validado && <span>VALIDADO</span>
                }
            </div>
            <div className="btn-group">
                <Link to="/" className="btn">Regresar</Link>
                <button onClick={ingresar} className="btn" type="submit">Ingresar</button>
            </div>
        </form>
    );
}

export default Registro;
