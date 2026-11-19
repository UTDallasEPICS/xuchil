"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Pencil, ChevronRight } from "lucide-react";
import Button from "@/components/Button";
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
          phone: authUser.worker?.phone ?? "",
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

  const iniciales = (userData.name || userData.email || "?")
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((p: string) => p.charAt(0).toUpperCase())
    .join("");

  return (
    <div className={styles.wrapper}>
      <header className={styles.head}>
        <h1 className={styles.title}>Perfil de usuario</h1>

        <div className={styles.editBtn}>
          <Button
            size="small"
            action="outline"
            onClick={() => router.push("/edit_user")}
          >
            <Pencil size={15} />
            Editar
          </Button>
        </div>
      </header>

      <section className={styles.card}>
        <div className={styles.identity}>
          {userData.avatar ? (
            <img
              className={styles.avatar}
              src={userData.avatar}
              alt={`Foto de ${userData.name}`}
            />
          ) : (
            <span className={styles.avatarFallback} aria-hidden="true">
              {iniciales}
            </span>
          )}

          <div className={styles.identityText}>
            <h2 className={styles.name}>{userData.name}</h2>
            {!!userData.position && (
              <p className={styles.position}>{userData.position}</p>
            )}
          </div>
        </div>
      </section>

      <section className={styles.card}>
        <div className={styles.infoRow}>
          <p className={styles.infoLabel}>Correo electrónico</p>
          <p className={styles.infoValue}>{userData.email}</p>
        </div>

        <div className={styles.infoRow}>
          <p className={styles.infoLabel}>Teléfono</p>
          {userData.phone ? (
            <p className={styles.infoValue}>{userData.phone}</p>
          ) : (
            <button
              type="button"
              className={styles.infoAdd}
              onClick={() => router.push("/edit_user")}
            >
              Agregar
            </button>
          )}
        </div>

        {userData.expiresAt && (
          <div className={styles.infoRow}>
            <p className={styles.infoLabel}>Vigencia</p>
            <p className={styles.infoValue}>
              {new Date(userData.expiresAt).toLocaleDateString("es-MX")}
            </p>
          </div>
        )}
      </section>

      {role === "admin" && (
        <button
          type="button"
          className={styles.menuRow}
          onClick={() => router.push("/create_user")}
        >
          <span className={styles.menuText}>Gestión de usuarios</span>
          <ChevronRight size={18} className={styles.menuChevron} />
        </button>
      )}

      <button
        type="button"
        className={styles.logout}
        onClick={() => setShowLogoutModal(true)}
      >
        Cerrar sesión
      </button>

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
