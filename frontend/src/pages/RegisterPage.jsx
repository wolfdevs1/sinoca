import React, { useContext, useState, useEffect, useCallback, useRef } from "react";
import { Link } from "react-router-dom";
import { SocketContext } from "../context/SocketContext";
import { AuthContext } from '../context/AuthContext';
import { register as registerAPI, getVariables } from "../services/auth";
import { parsePhoneNumberFromString, AsYouType } from 'libphonenumber-js/min';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export default function RegisterPage() {
  const [name, setName] = useState("");
  const [phoneRaw, setPhoneRaw] = useState("");
  const [phoneFormatted, setPhoneFormatted] = useState("");
  const [verified, setVerified] = useState(false);
  const [isValidPhone, setIsValidPhone] = useState(null);
  const [firstBonus, setFirstBonus] = useState(0);
  const [tokenTrigger, setTokenTrigger] = useState('');
  const [status, setStatus] = useState("idle");
  const [pixelId, setPixelId] = useState("");     // 👈 pixel desde variables

  const socket = useContext(SocketContext);
  const { login } = useContext(AuthContext);
  const initedPixelRef = useRef(null);            // 👈 evita doble init del mismo pixel

  // Traer variables (bonus + pixel) y luego inicializar Meta Pixel dinámicamente
  useEffect(() => {
    const fetchVars = async () => {
      try {
        const response = await getVariables();
        setFirstBonus(response.data.firstBonus ?? 0);
        setPixelId(response.data.pixel || "");
      } catch (error) {
        console.error('Error fetching variables:', error);
      }
    };
    fetchVars();
  }, []);

  // Inicializar Meta Pixel cuando tengamos pixelId
  useEffect(() => {
    if (!pixelId) return;

    // si ya inicializamos este mismo pixel, solo trackeamos y listo
    if (initedPixelRef.current === pixelId) {
      window.fbq?.('track', 'PageView');
      return;
    }

    // Cargar script si no existe
    if (!window.fbq) {
      (function (f, b, e, v, n, t, s) {
        if (f.fbq) return;
        n = f.fbq = function () {
          n.callMethod ? n.callMethod.apply(n, arguments) : n.queue.push(arguments);
        };
        if (!f._fbq) f._fbq = n;
        n.push = n;
        n.loaded = true;
        n.version = '2.0';
        n.queue = [];
        t = b.createElement(e);
        t.async = true;
        t.src = v;
        s = b.getElementsByTagName(e)[0];
        s.parentNode.insertBefore(t, s);
      })(window, document, 'script', 'https://connect.facebook.net/en_US/fbevents.js');
    }

    // Init + evento
    window.fbq('init', pixelId);
    window.fbq('track', 'PageView');
    initedPixelRef.current = pixelId;
  }, [pixelId]);

  const handleRegister = useCallback(async () => {
    try {
      toast.success('Creando usuario...');
      setStatus("creating");
      const parsed = parsePhoneNumberFromString("+54" + phoneRaw, "AR");
      if (!parsed?.isValid()) {
        toast.error("El número de teléfono no es válido.");
        setStatus("idle");
        return;
      }

      const formattedPhone = parsed.number.replace("+54", "549") + "@c.us";
      const res = await registerAPI({ name, phone: formattedPhone });

      const { token } = res.data;
      setTokenTrigger(token);
    } catch (error) {
      toast.error("Error al registrarse: " + (error.response?.data?.error || error.message));
      setStatus("idle");
    }
  }, [name, phoneRaw]);

  const isValidUsername = (username) => {
    const regex = /^[A-Za-z][A-Za-z0-9]{3,14}$/;
    return regex.test(username);
  };

  const ingresar = async (e) => {
    e.preventDefault();
    if (status !== "idle") return;

    if (!isValidUsername(name)) {
      toast.error("El nombre de usuario debe comenzar con una letra, ser alfanumérico y tener entre 4 y 15 caracteres.");
      return;
    }

    try {
      const parsed = parsePhoneNumberFromString("+54" + phoneRaw, "AR");
      if (!parsed?.isValid()) {
        toast.error("El número de teléfono no es válido.");
        return;
      }

      if (verified) {
        await handleRegister();
      } else {
        setStatus("validating");
        const formattedPhone = parsed.number.replace("+54", "549") + "@c.us";
        socket.emit("verify", name, formattedPhone, "register", '', (res) => {
          if (res.ok) {
            setVerified(true);
            toast.success(res.msg);
          } else {
            toast.error(res.msg);
            setStatus("idle");
          }
        });
      }
    } catch (err) {
      console.error("Error al registrar:", err);
      toast.error("Ocurrió un error.");
      setStatus("idle");
    }
  };

  useEffect(() => {
    if (tokenTrigger) {
      setTimeout(() => {
        localStorage.setItem('token', tokenTrigger);
        window.location.reload();
      }, 300);
    }
  }, [tokenTrigger]);

  useEffect(() => {
    const onVerified = (res) => {
      if (res.ok) {
        toast.success(res.msg);
        socket.emit("received-verified");
        handleRegister();
      } else {
        toast.error(res.msg);
        setStatus("idle");
      }
    };

    socket.on("verified", onVerified);
    socket.on("user-exists", async (name) => {
      socket.emit("received-verified");
      await login(name);
    });

    return () => {
      socket.off("verified", onVerified);
      socket.off("user-exists");
    };
  }, [socket, handleRegister, login, phoneRaw]);

  const handlePhoneChange = (e) => {
    const rawDigits = e.target.value.replace(/\D/g, "");
    const formatter = new AsYouType("AR");
    const formatted = formatter.input(rawDigits);

    setPhoneRaw(rawDigits);
    setPhoneFormatted(formatted);

    const parsed = parsePhoneNumberFromString("+54" + rawDigits, "AR");
    setIsValidPhone(parsed?.isValid() ?? false);
  };

  return (
    <React.Fragment>
      <form onSubmit={ingresar}>
        <h1>Registro</h1>
        <div style={{ textAlign: 'center', fontWeight: 'bold' }}>🎁 ¡Bonus {firstBonus}% en tu primera carga!</div>
        <input
          className="input"
          type="text"
          placeholder="Nombre de usuario"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
        <div className="phone-input-container">
          <div className="phone-input-wrapper">
            <div className="phone-prefix">+54 9</div>
            <input
              className="input phone-input"
              type="tel"
              value={phoneFormatted}
              onChange={handlePhoneChange}
              disabled={verified}
              required
              maxLength={12}
            />
            {isValidPhone !== null && (
              <span className="phone-validation-icon">
                {isValidPhone ? "✓" : "✗"}
              </span>
            )}
          </div>
          <p className="phone-hint">Cód. área sin el 0 y celular sin el 15</p>
        </div>
        <div className="btn-group">
          <button
            className={`btn ${status !== "idle" ? "gray" : ""}`}
            type="submit"
            disabled={status !== "idle"}
          >
            {status === "validating" && "Validando..."}
            {status === "creating" && "Creando usuario..."}
            {status === "idle" && "Registrarse"}
          </button>
          <div className="link-group">
            <span>¿Tienes una cuenta? </span>
            <Link to="/">Iniciar sesión</Link>
          </div>
        </div>
      </form>

      <ToastContainer />

      <style>{`
        .phone-input-container {
          width: 100%;
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .phone-input-wrapper {
          position: relative;
          display: flex;
          align-items: center;
          width: 100%;
        }

        .phone-prefix {
          position: absolute;
          left: 12px;
          top: 50%;
          transform: translateY(-50%);
          color: #9ca3af;
          font-weight: 500;
          font-size: 16px;
          z-index: 2;
          pointer-events: none;
          user-select: none;
        }

        .phone-input {
          padding-left: 62px !important;
          padding-right: 40px !important;
          width: 100%;
        }

        .phone-validation-icon {
          position: absolute;
          right: 12px;
          top: 50%;
          transform: translateY(-50%);
          font-size: 16px;
          font-weight: bold;
          z-index: 2;
          pointer-events: none;
          color: ${isValidPhone ? '#10b981' : '#ef4444'};
        }

        .phone-hint {
          font-size: 12px;
          color: #9ca3af;
          margin: 0;
          padding-left: 4px;
          font-style: italic;
        }

        @media (min-width: 768px) {
          .phone-hint {
            font-size: 13px;
          }

          .phone-prefix {
            font-size: 17px;
          }
        }
      `}</style>
    </React.Fragment>
  );
}