"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Button from "@/components/Button";
import HeaderXuchil from "@/components/HeaderXuchil";
import Modal from "@/components/Modal";
import styles from "./User.module.css";

import userService from "@/lib/services/userService";
import * as authService from "@/lib/services/authService";
import {UserRead, UserRestrictedUpdate} from "@/lib/schemas";

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

  // Guest management state
  const [guests, setGuests] = useState<UserRead[]>([]);
  const [showGuestSection, setShowGuestSection] = useState(false);
  const [newGuestName, setNewGuestName] = useState("");
  const [newGuestEmail, setNewGuestEmail] = useState("");
  const [newGuestPhone, setNewGuestPhone] = useState("");
  const [newGuestPassword, setNewGuestPassword] = useState("");
  const [guestLoading, setGuestLoading] = useState(false);

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

  // Load guests when admin opens section
  useEffect(() => {
    if (role === "admin" && showGuestSection) {
      loadGuests();
    }
  }, [role, showGuestSection]);

  const loadGuests = async () => {
    try {
      const data = await userService.getAllUsers({isGuest: true});
      setGuests(data);
    } catch (e) {
      console.error("Failed to load guests:", e);
    }
  };

  const handleCreateGuest = async () => {
    if (!newGuestName.trim()) return;
    setGuestLoading(true);
    try {
      await userService.createUser({
        name: newGuestName.trim(),
        email: newGuestEmail?.trim(),
        phone: newGuestPhone?.trim(),
        password: newGuestPassword,
        isGuest: true
      });
      setNewGuestName("");
      setNewGuestEmail("");
      setNewGuestPhone("");
      setNewGuestPassword("");
      await loadGuests();
    } catch (e) {
      console.error("Failed to create guest:", e);
    } finally {
      setGuestLoading(false);
    }
  };

  const handleDeleteGuest = async (guestId: number) => {
    try {
      await userService.deleteUser(guestId);
      await loadGuests();
    } catch (e) {
      console.error("Failed to delete guest:", e);
    }
  };

  const confirmLogout = async () => {
    await authService.logout().catch(() => null);
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

        {/* Guest Management Section - Admin only */}
        {role === "admin" && (
          <div className={styles.guestSection}>
            <button
              className={styles.guestToggle}
              onClick={() => setShowGuestSection(!showGuestSection)}
            >
              <span>👥 Invitados</span>
              <span>{showGuestSection ? "▲" : "▼"}</span>
            </button>

            {showGuestSection && (
              <div className={styles.guestContent}>
                {/* Guest List */}
                {guests.length > 0 ? (
                  <div className={styles.guestList}>
                    {guests.map((guest) => (
                      <div key={guest.id} className={styles.guestItem}>
                        <div>
                          <strong>{guest.name}</strong>
                          {guest.email && (
                            <span className={styles.guestContact}>
                              {" "}— {guest.email}
                            </span>
                          )}
                          {guest.phone && (
                              <span className={styles.guestContact}>
                              {" "}— {guest.phone}
                            </span>
                          )}
                        </div>
                        <button
                          className={styles.deleteGuestBtn}
                          onClick={() => handleDeleteGuest(guest.id)}
                          title="Eliminar invitado"
                        >
                          ✕
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className={styles.noGuests}>No hay invitados registrados</p>
                )}

                {/* Create Guest Form */}
                <div className={styles.guestForm}>
                  <h3 className={styles.guestFormTitle}>Nuevo invitado</h3>
                  <input
                    type="text"
                    placeholder="Nombre del invitado *"
                    value={newGuestName}
                    onChange={(e) => setNewGuestName(e.target.value)}
                    className={styles.guestInput}
                  />
                  <input
                    type="text"
                    placeholder="Correo electrónico"
                    value={newGuestEmail}
                    onChange={(e) => setNewGuestEmail(e.target.value)}
                    className={styles.guestInput}
                  />
                  <input
                    type="text"
                    placeholder="Teléfono"
                    value={newGuestPhone}
                    onChange={(e) => setNewGuestPhone(e.target.value)}
                    className={styles.guestInput}
                  />
                  <input
                    type="password"
                    placeholder="Contraseña"
                    value={newGuestPassword}
                    onChange={(e) => setNewGuestPassword(e.target.value)}
                    className={styles.guestInput}
                  />
                  <Button
                    size="small"
                    action="primary"
                    onClick={handleCreateGuest}
                  >
                    {guestLoading ? "Creando..." : "Agregar invitado"}
                  </Button>
                </div>
              </div>
            )}
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