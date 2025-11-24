"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Button from "@/components/Button";
import HeaderXuchil from "@/components/HeaderXuchil";
import Modal from "@/components/Modal";
import styles from "./User.module.css";

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
    localStorage.removeItem("currentUser");
    localStorage.removeItem("role");
    localStorage.removeItem("userData");
    router.push("/login");
  };
  
  if (!role || !userData) return null;

  return (
    <div className={`page ${styles.pageWrapper}`}>
      <HeaderXuchil />

      <div className={styles.actionButtonRight}>
        <Button
          size="small"
          action="secondary"
          onClick={() => router.push("/edit_user")}
        >
          Editar
        </Button>
      </div>

      {role === "admin" && (
        <div className={styles.actionButtonLeft}>
          <Button
            size="small"
            action="primary"
            onClick={() => router.push("/create_user")}
          >
            Crear usuario
          </Button>
        </div>
      )}

      <div className={styles.headerContainer}>
        <h1>Perfil de usuario</h1>
      </div>

      <div className={styles.contentWrapper}>
        <div className={styles.profileCard}>
          <img
            className={styles.avatar}
            src={userData.avatar || "/globe.svg"}
            alt="Avatar del usuario"
          />

          <h2 className={styles.profileName}>{userData.name}</h2>
          <p className={styles.profilePosition}>{userData.position}</p>
          <p className={styles.profileHours}>{userData.hours}</p>

          <div className={styles.infoGroup}>
            <p className={styles.infoLabel}>Correo electrónico:</p>
            <p className={styles.infoValue}>{userData.email}</p>

            <p className={styles.infoLabel}>Teléfono:</p>
            <p className={styles.infoValue}>{userData.phone}</p>
          </div>
        </div>

        <div className={styles.logoutWrapper}>
          <Button
            size="regular"
            action="negative"
            onClick={() => setShowLogoutModal(true)}
          >
            Cerrar sesión
          </Button>
        </div>
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