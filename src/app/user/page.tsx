"use client";
import { useRouter } from "next/navigation";
import Button from "@/components/Button";
import HeaderXuchil from "@/components/HeaderXuchil";

const UserProfile = () => {
  const router = useRouter();

  const handleLogout = () => {
    const confirmLogout = confirm("¿Estás seguro de que deseas cerrar sesión?");
    if (confirmLogout) {
      localStorage.removeItem("userData");
      sessionStorage.removeItem("authToken");
      router.push("/login");
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        backgroundColor: "var(--color-background)",
        paddingTop: "1rem",
      }}
    >
      <HeaderXuchil />

      <div
        style={{
          position: "relative",
          backgroundColor: "var(--color-background)",
          padding: "1.5rem",
          borderRadius: "20px",
          width: "90%",
          maxWidth: "360px",
          textAlign: "center",
        }}
      >
        <div style={{ position: "absolute", top: "1rem", right: "1rem" }}>
          <Button size="small" action="secondary" onClick={() => router.push("/edit_user")}>
            Editar
          </Button>
        </div>

        <img
          src="/globe.svg"
          alt="Avatar"
          style={{
            width: "140px",
            height: "140px",
            borderRadius: "50%",
            backgroundColor: "#ccc",
            margin: "0 auto 1rem",
          }}
        />

        <h2 style={{ color: "var(--color-green-dark)", margin: 0 }}>Antonio López</h2>
        <p style={{ color: "var(--color-green-light)", margin: "4px 0 12px" }}>Operador</p>
        <p style={{ fontSize: "0.9rem", margin: "0 0 1rem" }}>15.4hrs trabajadas</p>

        <p style={{ fontWeight: 600, color: "var(--color-green-dark)", marginBottom: "4px" }}>
          Correo Electrónico:
        </p>
        <p style={{ marginBottom: "1rem" }}>antonio.lopez@xuchilnatural.com</p>

        <p style={{ fontWeight: 600, color: "var(--color-green-dark)", marginBottom: "4px" }}>
          Teléfono:
        </p>
        <p>
          <strong style={{ color: "var(--color-green-dark)" }}>+52 951</strong> 123 56 78
        </p>
      </div>

      <div style={{ marginTop: "2rem" }}>
        <Button size="regular" action="negative" onClick={handleLogout}>
          Cerrar sesión
        </Button>
      </div>
    </div>
  );
};

export default UserProfile;
