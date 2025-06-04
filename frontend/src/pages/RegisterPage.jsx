import React from 'react';
import { useContext, useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { SocketContext } from "../context/SocketContext";
import { register as registerAPI } from "../services/auth";
import { parsePhoneNumberFromString, AsYouType } from "libphonenumber-js";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export default function RegisterPage() {
  const [name, setName] = useState("");
  const [phoneRaw, setPhoneRaw] = useState(""); // solo dígitos
  const [phoneFormatted, setPhoneFormatted] = useState(""); // lo que se ve en el input
  const [verified, setVerified] = useState(false);
  const [isValidPhone, setIsValidPhone] = useState(null);

  const [tokenTrigger, setTokenTrigger] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const socket = useContext(SocketContext);

  const handleRegister = useCallback(async () => {
    try {
      setIsSubmitting(true);

      const parsed = parsePhoneNumberFromString("+54" + phoneRaw, "AR");
      if (!parsed?.isValid()) {
        toast.error("El número de teléfono no es válido.");
        setIsSubmitting(false);
        return;
      }

      const formattedPhone = parsed.number.replace("+54", "549") + "@c.us";

      const res = await registerAPI({ name, phone: formattedPhone });
      const { token } = res.data;
      setTokenTrigger(token);
    } catch (error) {
      toast.error("Error al registrarse: " + (error.response?.data?.error || error.message));
      setIsSubmitting(false);
    }
  }, [name, phoneRaw]);

  const ingresar = async (e) => {
    e.preventDefault();
    if (isSubmitting) return;
    setIsSubmitting(true);

    try {
      const parsed = parsePhoneNumberFromString("+54" + phoneRaw, "AR");
      if (!parsed?.isValid()) {
        toast.error("El número de teléfono no es válido.");
        setIsSubmitting(false);
        return;
      }

      if (verified) {
        toast.success('Creando usuario...');
        await handleRegister();
      } else {
        const formattedPhone = parsed.number.replace("+54", "549") + "@c.us";
        socket.emit("verify", name, formattedPhone, "register", (res) => {
          if (res.ok) {
            setVerified(true);
            toast.success(res.msg);
          } else {
            toast.error(res.msg);
          }
        });
      }
    } catch (err) {
      toast.error("Ocurrió un error.");
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    if (tokenTrigger) {
      localStorage.setItem('token', tokenTrigger);
      window.location.reload();
    }
  }, [tokenTrigger]);

  useEffect(() => {
    const onVerified = (res) => {
      if (res.ok) {
        handleRegister();
      } else {
        toast.error(res.msg);
      }
    };

    socket.on("verified", onVerified);
    return () => {
      socket.off("verified", onVerified);
    };
  }, [socket, handleRegister]);

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
            <div className="phone-prefix">+54</div>
            <input
              className="input phone-input"
              type="tel"
              value={phoneFormatted}
              onChange={handlePhoneChange}
              disabled={verified}
              required
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
            className={`btn ${isSubmitting ? "gray" : ""}`}
            type="submit"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Registrando..." : "Registrarse"}
          </button>
          <div className="link-group">
            <span>¿Tienes una cuenta? </span>
            <Link to="/">Iniciar sesión</Link>
          </div>
        </div>
      </form>

      <ToastContainer />

      <style jsx>{`
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
          padding-left: 50px !important;
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
