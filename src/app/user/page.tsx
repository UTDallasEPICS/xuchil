"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Button from "@/components/Button";
import HeaderXuchil from "@/components/HeaderXuchil";
import Modal from "@/components/Modal";
import styles from "./User.module.css";

const UserProfile = () => {
  const router = useRouter();
  const [showLogoutModal, setShowLogoutModal] = useState<boolean>(false);
  const [role, setRole] = useState<"user" | "admin" | null>(null);
  const [userData, setUserData] = useState<user | null>(null);

  interface user { 
    name: string,
    position: string,
    hours: number,
    email: string,
    phone: string,
    avatar: string,
    role: "user" | "admin"

  }

  useEffect(() => {

const retrieveUser = async () => { 
  try { 

    const response = await fetch(`/api/users/me`,{method: 'GET'})

    const person = await response.json()

    const User: user = {
      name: person.worker?.fullName,
      position: "Operador",
      hours: 15,
      email: person.email,
      phone: person.worker?.phone,
      avatar: person.worker?.profilePhotoUrl,
      role: person.isAdmin ? 'admin' : 'user'
    };
  


    setUserData(User);
    setRole(User.role);

  }catch(err) { 
    console.log("error",err)
  }
}

retrieveUser()

  }, []);

  const confirmLogout = async () => {

    try { 

await fetch('api/auth/logout', {method: "POST"})

  
  
    router.push("/login");
    }catch(err) { 
      console.log("error logging user out",err)
    }
  };

  if (!userData) {
    return <div style={{ padding: "2rem" }}>Loading...</div>;
  }

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
            onClick={() =>
              { 

                
                setShowLogoutModal(true)


              }}
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
