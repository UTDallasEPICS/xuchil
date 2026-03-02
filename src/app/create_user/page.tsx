"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import HeaderXuchil from "@/components/HeaderXuchil";
import Button from "@/components/Button";
import Modal from "@/components/Modal";

const CreateUser = () => {
  const router = useRouter();

  const [name, setName] = useState("");
  const [lastName, setLastName] = useState("");
  const [secondLastName, setSecondLastName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [modal, setModal] = useState({
    open: false,
    title: "",
    message: "",
    error: false,
  });

  const isPasswordValid = (pwd: string) =>
    /[a-z]/.test(pwd) &&
    /[A-Z]/.test(pwd) &&
    /\d/.test(pwd) &&
    pwd.length >= 8;

  const isEmailValid = (email: string) =>
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const isPhoneValid = (phone: string) =>
    phone.replace(/\D/g, "").length >= 10;

  const handleCreateUser = async () => {
    if (
      !name ||
      !lastName ||
      !secondLastName ||
      !phone ||
      !email ||
      !username ||
      !password ||
      !confirmPassword
    ) {
      return setModal({
        open: true,
        title: "Campos incompletos",
        message: "Por favor completa todos los campos.",
        error: true,
      });
    }

    if (!isPhoneValid(phone)) {
      return setModal({
        open: true,
        title: "Teléfono inválido",
        message: "El número debe tener al menos 10 dígitos.",
        error: true,
      });
    }

    if (!isEmailValid(email)) {
      return setModal({
        open: true,
        title: "Correo inválido",
        message: "Ingresa un correo electrónico válido.",
        error: true,
      });
    }

    if (password !== confirmPassword) {
      return setModal({
        open: true,
        title: "Contraseñas no coinciden",
        message: "La contraseña y su confirmación deben ser iguales.",
        error: true,
      });
    }

    if (!isPasswordValid(password)) {
      return setModal({
        open: true,
        title: "Contraseña inválida",
        message: "Debe tener al menos 8 caracteres, una mayúscula, una minúscula y un número.",
        error: true,
      });
    }

    try {
      const response = await fetch("/api/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          fullName: `${name} ${lastName} ${secondLastName}`.trim(),
          phone,
          email,
          profilePhotoUrl: null,
          password,
        }),
      });

      if (!response.ok) {
        const payload = await response.json().catch(() => null);
        return setModal({
          open: true,
          title: "Error al crear usuario",
          message: payload?.error || "No se pudo registrar el usuario.",
          error: true,
        });
      }

      setModal({
        open: true,
        title: "Usuario creado",
        message: "El nuevo usuario ha sido registrado exitosamente.",
        error: false,
      });
    } catch {
      return setModal({
        open: true,
        title: "Error al crear usuario",
        message: "Ocurrió un problema de red al registrar el usuario.",
        error: true,
      });
    }
  };

  const handleModalClose = () => {
    setModal({ ...modal, open: false });
    if (!modal.error) router.push("/user");
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        backgroundColor: "var(--color-background)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        paddingTop: "1rem",
      }}
    >
      <HeaderXuchil />

      <div
        style={{
          width: "90%",
          maxWidth: "360px",
          backgroundColor: "var(--color-background)",
          padding: "24px",
          borderRadius: "20px",
        }}
      >
        <h2 style={{ textAlign: "center", marginBottom: "1rem" }}>
          Crear nuevo usuario
        </h2>

        {[
          { label: "Nombre", value: name, set: setName },
          { label: "Apellido Paterno", value: lastName, set: setLastName },
          { label: "Apellido Materno", value: secondLastName, set: setSecondLastName },
          { label: "Teléfono", value: phone, set: setPhone },
          { label: "Correo", value: email, set: setEmail },
          { label: "Usuario", value: username, set: setUsername },
        ].map((field, idx) => (
          <div key={idx} style={{ marginBottom: "12px" }}>
            <label>{field.label}:</label>
            <input
              type="text"
              value={field.value}
              onChange={(e) => field.set(e.target.value)}
              style={{
                width: "100%",
                padding: "10px",
                borderRadius: "10px",
                border: "1px solid #333",
                marginTop: "4px",
                boxSizing: "border-box",
              }}
            />
          </div>
        ))}

        <div style={{ marginBottom: "12px" }}>
          <label>Contraseña:</label>
          <input
            type={showPassword ? "text" : "password"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={{
              width: "100%",
              padding: "10px",
              borderRadius: "10px",
              border: "1px solid #333",
              marginTop: "4px",
              boxSizing: "border-box",
            }}
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            style={{
              marginTop: "4px",
              background: "none",
              color: "var(--color-green-dark)",
              border: "none",
              cursor: "pointer",
              fontSize: "0.9rem",
              textDecoration: "underline",
            }}
          >
            {showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
          </button>
        </div>

        <div style={{ marginBottom: "20px" }}>
          <label>Confirmar Contraseña:</label>
          <input
            type={showConfirmPassword ? "text" : "password"}
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            style={{
              width: "100%",
              padding: "10px",
              borderRadius: "10px",
              border: "1px solid #333",
              marginTop: "4px",
              boxSizing: "border-box",
            }}
          />
          <button
            type="button"
            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            style={{
              marginTop: "4px",
              background: "none",
              color: "var(--color-green-dark)",
              border: "none",
              cursor: "pointer",
              fontSize: "0.9rem",
              textDecoration: "underline",
            }}
          >
            {showConfirmPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
          </button>
        </div>

        <Button
          size="regular"
          action="primary"
          onClick={handleCreateUser}
          style={{ width: "100%", marginBottom: "50px" }}
        >
          Crear usuario
        </Button>
      </div>

      <Modal
        open={modal.open}
        title={modal.title}
        message={modal.message}
        confirmText="Aceptar"
        onlyConfirm
        onConfirm={handleModalClose}
        danger={modal.error}
      />
    </div>
  );
};

export default CreateUser;
