"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Button from "@/components/Button";
import HeaderXuchil from "@/components/HeaderXuchil";
import Modal from "@/components/Modal";
import styles from "./Login.module.css";

const Login = () => {
  const router = useRouter();

  const [user, setUser] = useState("");
  const [password, setPassword] = useState("");
  const [showErrorModal, setShowErrorModal] = useState(false);
  
  const handleLogin = async () => {
    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: user,
          password,
        }),
      });

      if (!response.ok) {
        setShowErrorModal(true);
        return;
      }

      router.push("/process-control");
    } catch {
      setShowErrorModal(true);
    }
  };

  return (
    <div className={styles.page}>
        <HeaderXuchil />

        <div className={styles.card}>
          <h1 className={styles.title}>Bienvenido</h1>

          <input
            type="text"
            placeholder="Usuario"
            value={user}
            onChange={(e) => setUser(e.target.value)}
            className={styles.input}
          />

          <input
            type="password"
            placeholder="Contraseña"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className={styles.input}
          />

          <div className={styles.submit}>
            <Button size="regular" action="primary" onClick={handleLogin}>
              Iniciar sesión
            </Button>
          </div>

          <p className={styles.help}>¿Perdiste tu contraseña?</p>
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
  );
};

export default Login;