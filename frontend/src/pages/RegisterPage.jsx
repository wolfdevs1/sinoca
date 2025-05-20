import React from 'react';
import { useContext, useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { SocketContext } from "../context/SocketContext";
import { register as registerAPI } from "../services/auth";
import { parsePhoneNumberFromString, AsYouType } from "libphonenumber-js";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css'; // Asegúrate de importar los estilos

export default function RegisterPage() {
  const [name, setName] = useState("");
  const [phoneRaw, setPhoneRaw] = useState("");
  const [phoneFormatted, setPhoneFormatted] = useState("");
  const [verified, setVerified] = useState(false);
  const [isValidPhone, setIsValidPhone] = useState(null);

  const [tokenTrigger, setTokenTrigger] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const socket = useContext(SocketContext);

  const handleRegister = useCallback(async () => {
    try {

      setIsSubmitting(true);

      const parsed = parsePhoneNumberFromString(phoneRaw, "AR");
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

    if (isSubmitting) return; // Evita múltiples clics
    setIsSubmitting(true);

    try {
      const parsed = parsePhoneNumberFromString(phoneRaw, "AR");
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
  }, [tokenTrigger])

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

    const parsed = parsePhoneNumberFromString(rawDigits, "AR");
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

        <div className="input-icon-group">
          <input
            className="input"
            type="tel"
            placeholder="Celular"
            value={phoneFormatted}
            onChange={handlePhoneChange}
            disabled={verified}
            required
          />
          {isValidPhone !== null && (
            <span className="input-icon">
              {isValidPhone ? "✓" : ""}
            </span>
          )}
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
    </React.Fragment>
  );
}