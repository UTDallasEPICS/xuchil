"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Button from "@/components/Button";
import HeaderXuchil from "@/components/HeaderXuchil";
import Modal from "@/components/Modal";

const UserProfile = () => {
  const router = useRouter();
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [role, setRole] = useState<"user" | "admin" | null>(null);
  const [userData, setUserData] = useState<any>(null);

  useEffect(() => {
    const storedRole = localStorage.getItem("role") as "user" | "admin" | null;
    const storedUserData = localStorage.getItem("userData");
    
    if (!storedRole || !storedUserData) {
      router.push("/login");
    } else {
      setRole(storedRole);
      setUserData(JSON.parse(storedUserData));
    }
  }, []);

  const confirmLogout = () => {
    // Solo eliminamos los datos de sesión, no los datos del perfil
    localStorage.removeItem("currentUser");
    localStorage.removeItem("role");
    localStorage.removeItem("userData");
    router.push("/login");
  };
  
  if (!role || !userData) return null;

  return (
    <div
      style={{
        minHeight: "100vh",
        backgroundColor: "var(--color-background)",
        paddingTop: "1rem",
        position: "relative",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
      }}
    >
      <HeaderXuchil />

      {/* Botón editar */}
      <div
        style={{
          position: "absolute",
          top: "1rem",
          right: "1rem",
          zIndex: 10,
        }}
      >
        <Button
          size="small"
          action="secondary"
          onClick={() => router.push("/edit_user")}
        >
          Editar
        </Button>
      </div>

      {/* Botón crear usuario solo para admin */}
      {role === "admin" && (
        <div
          style={{
            position: "absolute",
            top: "1rem",
            left: "1rem",
            zIndex: 10,
          }}
        >
          <Button
            size="small"
            action="primary"
            onClick={() => router.push("/create_user")}
          >
            Crear usuario
          </Button>
        </div>
      )}

      <div
        style={{
          backgroundColor: "var(--color-background)",
          padding: "1.5rem",
          borderRadius: "20px",
          width: "90%",
          maxWidth: "360px",
          textAlign: "center",
        }}
      >
        <img
          src={userData.avatar || "/globe.svg"}
          alt="Avatar"
          style={{
            width: "140px",
            height: "140px",
            borderRadius: "50%",
            backgroundColor: "#ccc",
            margin: "0 auto 1rem",
            objectFit: "cover",
          }}
        />

        <h2 style={{ color: "var(--color-green-dark)", margin: 0 }}>
          {userData.name}
        </h2>
        <p style={{ color: "var(--color-green-light)", margin: "4px 0 12px" }}>
          {userData.position}
        </p>
        <p style={{ fontSize: "0.95rem", margin: "0 0 1.5rem" }}>
          {userData.hours}
        </p>

        <div style={{ textAlign: "left" }}>
          <p
            style={{
              fontWeight: 600,
              color: "var(--color-green-dark)",
              marginBottom: "4px",
              fontSize: "1.1rem",
            }}
          >
            Correo Electrónico:
          </p>
          <p style={{ marginBottom: "1rem", fontSize: "1rem" }}>
            {userData.email}
          </p>

          <p
            style={{
              fontWeight: 600,
              color: "var(--color-green-dark)",
              marginBottom: "4px",
              fontSize: "1.1rem",
            }}
          >
            Teléfono:
          </p>
          <p style={{ fontSize: "1rem" }}>
            {userData.phone}
          </p>
        </div>
      </div>

      <div style={{ marginTop: "0.5rem", marginBottom: "5rem" }}>
        <Button
          size="regular"
          action="negative"
          onClick={() => setShowLogoutModal(true)}
        >
          Cerrar sesión
        </Button>
      </div>

      <Modal
        open={showLogoutModal}
        title="¿Cerrar sesión?"
        message="Esto cerrará tu sesión actual. ¿Deseas continuar?"
        confirmText="Cerrar sesión"
        cancelText="Cancelar"
        onCancel={() => setShowLogoutModal(false)}
        onConfirm={confirmLogout}
        danger
      />
    </div>
  );
};

export default UserProfile;