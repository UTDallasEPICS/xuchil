"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Button from "@/components/Button";
import HeaderXuchil from "@/components/HeaderXuchil";

const Login = () => {
  const router = useRouter();
  const [user, setUser] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = () => {
    if (user === "prueba" && password === "Prueba123") {
      router.push("/dashboard");
    } else {
      alert("Usuario o contraseña incorrectos");
    }
  };

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        minHeight: "100vh",
        justifyContent: "center",
        backgroundColor: "var(--color-background)",
      }}
    >
      <HeaderXuchil />

      <div
        style={{
          backgroundColor: "var(--color-green-light)",
          borderRadius: "25px",
          padding: "24px 16px",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          width: "90%",
          maxWidth: "320px",
        }}
      >
        <h1
          style={{
            color: "white",
            fontWeight: "bold",
            fontSize: "1.8rem",
            marginBottom: "16px",
          }}
        >
          Bienvenido
        </h1>

        <input
          type="text"
          placeholder="Usuario"
          value={user}
          onChange={(e) => setUser(e.target.value)}
          style={{
            width: "100%",
            padding: "10px",
            borderRadius: "6px",
            border: "none",
            marginBottom: "12px",
          }}
        />

        <input
          type="password"
          placeholder="Contraseña"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          style={{
            width: "100%",
            padding: "10px",
            borderRadius: "6px",
            border: "none",
            marginBottom: "16px",
          }}
        />

        <div style={{ width: "100%" }}>
          <Button size="regular" action="primary" onClick={handleLogin}>
            Iniciar sesión
          </Button>
        </div>

        <p
          style={{
            fontSize: "0.85rem",
            color: "var(--color-text-light)",
            marginTop: "12px",
          }}
        >
          ¿Perdiste tu contraseña?
        </p>
      </div>
    </div>
  );
};

export default Login;