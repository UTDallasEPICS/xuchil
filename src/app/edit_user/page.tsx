"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import HeaderXuchil from "@/components/HeaderXuchil";
import Button from "@/components/Button";
import Modal from "@/components/Modal";

const EditProfile = () => {
  const router = useRouter();

  const [name, setName] = useState("Antonio");
  const [lastName, setLastName] = useState("López");
  const [secondLastName, setSecondLastName] = useState("Sánchez");
  const [email, setEmail] = useState("antoniolopez@xuchilnatural.com");
  const [phone, setPhone] = useState("+52 9511234567");

  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const handleSave = () => {
    setShowSuccessModal(true);
  };

  const handleConfirm = () => {
    setShowSuccessModal(false);
    router.push("/user");
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
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          boxSizing: "border-box",
        }}
      >
        {/* Imagen y botón subir */}
        <img
          src="/user-placeholder.svg"
          alt="Foto de perfil"
          style={{
            width: "140px",
            height: "140px",
            borderRadius: "50%",
            backgroundColor: "#ccc",
            marginBottom: "12px",
            textAlign: "center",
          }}
        />

        <Button
          size="small"
          action="secondary"
        >
          Subir Foto
        </Button>

        {/* Formulario */}
        <div
          style={{
            width: "100%",
            marginTop: "20px",
            paddingLeft: "8px",
            paddingRight: "8px",
            boxSizing: "border-box",
          }}
        >
          <label>Nombre:</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            style={{
              width: "100%",
              padding: "10px",
              borderRadius: "10px",
              border: "1px solid #333",
              marginBottom: "12px",
              boxSizing: "border-box",
            }}
          />

          <label>Apellido Paterno:</label>
          <input
            type="text"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            style={{
              width: "100%",
              padding: "10px",
              borderRadius: "10px",
              border: "1px solid #333",
              marginBottom: "12px",
              boxSizing: "border-box",
            }}
          />

          <label>Apellido Materno:</label>
          <input
            type="text"
            value={secondLastName}
            onChange={(e) => setSecondLastName(e.target.value)}
            style={{
              width: "100%",
              padding: "10px",
              borderRadius: "10px",
              border: "1px solid #333",
              marginBottom: "12px",
              boxSizing: "border-box",
            }}
          />

          <label>Correo Electrónico:</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={{
              width: "100%",
              padding: "10px",
              borderRadius: "10px",
              border: "1px solid #333",
              marginBottom: "12px",
              boxSizing: "border-box",
            }}
          />

          <label>Teléfono:</label>
          <input
            type="text"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            style={{
              width: "100%",
              padding: "10px",
              borderRadius: "10px",
              border: "1px solid #333",
              marginBottom: "20px",
              boxSizing: "border-box",
            }}
          />
        </div>

        <Button
          size="regular"
          action="primary"
          onClick={handleSave}
          style={{ marginTop: "10px", marginBottom: "50px", width: "100%" }}
        >
          Listo
        </Button>
      </div>

      <Modal
        open={showSuccessModal}
        title="¡Cambios guardados!"
        message="Tu perfil ha sido actualizado exitosamente."
        confirmText="Aceptar"
        onlyConfirm
        onConfirm={handleConfirm}
      />
    </div>
  );
};

export default EditProfile;
