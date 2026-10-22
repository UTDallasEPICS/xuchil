"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Button from "@/components/Button";
import HeaderXuchil from "@/components/HeaderXuchil";
import Modal from "@/components/Modal";
import styles from "./User.module.css";

interface UserData {
  name: string;
  email: string;
  phone: string;
  avatar: string;
  position: string;
  expiresAt: string | null;
  hours: string;
}

const UserProfile = () => {
  const router = useRouter();
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [role, setRole] = useState<"user" | "admin" | null>(null);
  const [userData, setUserData] = useState<UserData | null>(null);

  useEffect(() => {
    let mounted = true;

    async function loadProfile() {
      try {
        const response = await fetch("/api/users/me", { credentials: "include" });
        if (!response.ok) {
          router.push("/login");
          return;
        }

        const authUser = await response.json();
        if (!mounted) return;

        setRole(authUser.isAdmin ? "admin" : "user");
        setUserData({
          name: authUser.worker?.fullName ?? "",
          email: authUser.email,
          phone: authUser.worker?.phone ?? "No especificado",
          avatar: authUser.worker?.profilePhotoUrl ?? "",
          position: authUser.worker?.role?.name ?? "Operador",
          expiresAt: authUser.worker?.expiresAt ?? null,
          hours: "",
        });
      } catch {
        router.push("/login");
      }
    }

    loadProfile();

    return () => {
      mounted = false;
    };
  }, [router]);

  const confirmLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" }).catch(() => null);
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
          {userData.expiresAt && (
            <p className={styles.profileHours}>
              Vigencia: {new Date(userData.expiresAt).toLocaleDateString("es-MX")}
            </p>
          )}
          <p className={styles.profileHours}>{userData.hours}</p>

          <div className={styles.infoGroup}>
            <p className={styles.infoLabel}>Correo electrónico:</p>
            <p className={styles.infoValue}>{userData.email}</p>

            <p className={styles.infoLabel}>Teléfono:</p>
            <p className={styles.infoValue}>{userData.phone}</p>
          </div>
        </div>

        {/* Panel de administración simplificado (Solo Admin) */}
        {role === "admin" && (
          <div style={{ marginTop: "20px", width: "100%", maxWidth: "420px" }}>
            <Button
              size="regular"
              action="primary"
              onClick={() => router.push("/create_user")}
              style={{ width: "100%" }}
            >
              Administrar y Crear Usuarios
            </Button>
            <Button
              size="regular"
              action="secondary"
              onClick={() => router.push("/analytics")}
              style={{ width: "100%", marginTop: "10px" }}
            >
              Analíticas
            </Button>
          </div>
        )}

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