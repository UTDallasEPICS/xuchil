"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Button from "@/components/Button";
import HeaderXuchil from "@/components/HeaderXuchil";
import Modal from "@/components/Modal";

const Login = () => {
  const router = useRouter();

  const [user, setUser] = useState("");
  const [password, setPassword] = useState("");
  const [showErrorModal, setShowErrorModal] = useState(false);
  
  const handleLogin = async () => {
    setShowErrorModal(false);
  
    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: user, password }),
      });
  
      
      if (!response.ok) {
        setShowErrorModal(true);
        return;
      }
  
      router.push("/process-control");
    } catch (err) {
      console.log("login error", err);
      setShowErrorModal(true);
    }
  };
  

  return (
    <div className="login-page">
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          minHeight: "100vh",
          justifyContent: "center",
          backgroundColor: "var(--color-background)",
          width: "100%",
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
            width: "80%",
            maxWidth: "320px",
            marginBlockEnd: "5rem",
            marginTop: "1rem",
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
              width: "70%",
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
              width: "70%",
              padding: "10px",
              borderRadius: "6px",
              border: "none",
              marginBottom: "16px",
            }}
          />

          <div style={{ 
            width: "100%", 
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
          }}>
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

        <Modal
          open={showErrorModal}
          title="Error de autenticación"
          message="Usuario o contraseña incorrectos. Por favor intenta nuevamente."
          confirmText="Aceptar"
          onlyConfirm
          onConfirm={() => setShowErrorModal(false)}
        />
      </div>
    </div>
  );
};

export default Login;