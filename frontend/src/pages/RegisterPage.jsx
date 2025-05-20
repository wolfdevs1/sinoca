import { useContext, useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { SocketContext } from "../context/SocketContext";
import { register as registerAPI } from "../services/auth";
import { parsePhoneNumberFromString, AsYouType } from "libphonenumber-js";

export default function RegisterPage() {
  const [name, setName] = useState("");
  const [phoneRaw, setPhoneRaw] = useState("");
  const [phoneFormatted, setPhoneFormatted] = useState("");
  const [verified, setVerified] = useState(false);
  const [isValidPhone, setIsValidPhone] = useState(null);

  const socket = useContext(SocketContext);

  const handleRegister = useCallback(async () => {
    try {
      const parsed = parsePhoneNumberFromString(phoneRaw, "AR");
      if (!parsed?.isValid()) {
        alert("El número de teléfono no es válido.");
        return;
      }

      const formattedPhone = parsed.number.replace("+", "") + "@c.us";

      const res = await registerAPI({ name, phone: formattedPhone });
      const { token } = res.data;
      localStorage.setItem("token", token);
      window.location.href = "/";
    } catch (error) {
      alert("Error al registrarse: " + (error.response?.data?.error || error.message));
    }
  }, [name, phoneRaw]);

  const ingresar = async (e) => {
    e.preventDefault();

    const parsed = parsePhoneNumberFromString(phoneRaw, "AR");
    if (!parsed?.isValid()) {
      alert("El número de teléfono no es válido.");
      return;
    }

    if (verified) {
      await handleRegister();
      return;
    }

    const formattedPhone = parsed.number.replace("+", "") + "@c.us";

    socket.emit("verify", name, formattedPhone, "register", (res) => {
      if (res.ok) {
        setVerified(true);
        alert(res.msg);
      } else {
        alert(res.msg);
      }
    });
  };

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
            {isValidPhone ? "✓" : "X"}
          </span>
        )}
      </div>

      <div className="btn-group">
        <button className="btn" type="submit">
          Ingresar
        </button>
        <div className="link-group">
          <span>¿Tienes una cuenta? </span>
          <Link to="/">Iniciar sesión</Link>
        </div>
      </div>
    </form>
  );
}