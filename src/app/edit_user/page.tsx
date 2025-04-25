"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import HeaderXuchil from "@/components/HeaderXuchil";
import Button from "@/components/Button";

const EditProfile = () => {
  const router = useRouter();

  const [name, setName] = useState("Antonio López");
  const [role, setRole] = useState("Operador");
  const [hours, setHours] = useState("15.4hrs trabajadas");
  const [email, setEmail] = useState("antonio.lopez@xuchilnatural.com");
  const [phone, setPhone] = useState("9511235678");

  const handleSave = () => {
    alert("Cambios guardados exitosamente ✅");
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
          backgroundColor: "var(--color-secondary)",
          borderRadius: "20px",
          padding: "24px",
          marginTop: "1rem",
        }}
      >
        <h2 style={{ textAlign: "center", marginBottom: "1rem" }}>
          Editar Perfil
        </h2>

        <label>Nombre</label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          style={{ width: "100%", marginBottom: "12px", padding: "8px" }}
        />

        <label>Empleo</label>
        <input
          type="text"
          value={role}
          onChange={(e) => setRole(e.target.value)}
          style={{ width: "100%", marginBottom: "12px", padding: "8px" }}
        />

        <label>Horas trabajadas</label>
        <input
          type="text"
          value={hours}
          onChange={(e) => setHours(e.target.value)}
          style={{ width: "100%", marginBottom: "12px", padding: "8px" }}
        />

        <label>Correo electrónico</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          style={{ width: "100%", marginBottom: "12px", padding: "8px" }}
        />

        <label>Teléfono</label>
        <input
          type="text"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          style={{ width: "100%", marginBottom: "24px", padding: "8px" }}
        />

        <Button size="regular" action="primary" onClick={handleSave}>
          Listo
        </Button>
      </div>
    </div>
  );
};

export default EditProfile;
