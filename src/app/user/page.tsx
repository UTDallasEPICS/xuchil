"use client";
import {useState, useEffect} from "react";
import {useRouter} from "next/navigation";
import Button from "@/components/Button";
import HeaderXuchil from "@/components/HeaderXuchil";
import Modal from "@/components/Modal";
import styles from "./User.module.css";

import userService from "@/lib/services/userClient";
import * as authService from "@/lib/services/authClient";
import {UserRead,} from "@/lib/schemas";

interface UserData {
  name: string;
  email?: string | null;
  phone?: string;
  avatar?: string;
  position?: string;
  hours?: string;
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
        const user = await userService.getCurrentUser();
        if (!mounted) return;

        let position = "Operador";
        if (user.isAdmin) position = "Administracion";

        setRole(user.isAdmin ? "admin" : "user");
        setUserData({
          name: user.name ?? "",
          email: user.email ?? "",
          phone: user.phone ?? "No especificado",
          avatar: user.imgUrl ?? "",
          position: position,
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
    await authService.logout().catch(() => null);
    router.push("/login");
  };

//when clicked downloaded excel file of the workers pay based of how much they worked
  const workerHours = async () => {

    try {
      //left off here


    } catch (err) {

      console.log("err", err)
    }


  }


  if (!role || !userData) return null;

  return (
      <div className={`page ${styles.pageWrapper}`}>
        <HeaderXuchil/>

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
              <Button
                  size="small"
                  action="secondary"
                  onClick={workerHours}
                  style={{marginLeft: "3px"}}
              >
                worker hours

              </Button>
              <div style={{marginTop: "3px"}}>
                <Button
                    size="small"
                    action="secondary"
                    onClick={() => router.push("/analytics")}>
                  Analytics
                </Button>
              </div>
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