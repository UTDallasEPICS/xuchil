"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Button from "@/components/Button";
import HeaderXuchil from "@/components/HeaderXuchil";
import Modal from "@/components/Modal";
import styles from "./User.module.css";

interface Guest {
  id: number;
  displayName: string;
  contactInfo: string | null;
}

const UserProfile = () => {
  const router = useRouter();
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [role, setRole] = useState<"user" | "admin" | null>(null);
  const [userData, setUserData] = useState<any>(null);

  // Guest management state
  const [guests, setGuests] = useState<Guest[]>([]);
  const [showGuestSection, setShowGuestSection] = useState(false);
  const [newGuestName, setNewGuestName] = useState("");
  const [newGuestContact, setNewGuestContact] = useState("");
  const [newGuestPassword, setNewGuestPassword] = useState("");
  const [guestLoading, setGuestLoading] = useState(false);

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
  }, []);

  // Load guests when admin opens section
  useEffect(() => {
    if (role === "admin" && showGuestSection) {
      loadGuests();
    }
  }, [role, showGuestSection]);

  const loadGuests = async () => {
    try {
      const res = await fetch("/api/guests", { credentials: "include" });
      if (res.ok) {
        const data = await res.json();
        setGuests(data);
      }
    } catch (e) {
      console.error("Failed to load guests:", e);
    }
  };

  const handleCreateGuest = async () => {
    if (!newGuestName.trim()) return;
    setGuestLoading(true);
    try {
      const res = await fetch("/api/guests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          displayName: newGuestName.trim(),
          contactInfo: newGuestContact.trim() || null,
          password: newGuestPassword || null,
        }),
      });
      if (res.ok) {
        setNewGuestName("");
        setNewGuestContact("");
        setNewGuestPassword("");
        await loadGuests();
      }
    } catch (e) {
      console.error("Failed to create guest:", e);
    } finally {
      setGuestLoading(false);
    }
  };

  const handleDeleteGuest = async (guestId: number) => {
    try {
      await fetch(`/api/guests/${guestId}`, {
        method: "DELETE",
        credentials: "include",
      });
      await loadGuests();
    } catch (e) {
      console.error("Failed to delete guest:", e);
    }
  };

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
                          <strong>{guest.displayName}</strong>
                          {guest.contactInfo && (
                            <span className={styles.guestContact}>
                              {" "}— {guest.contactInfo}
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
                    placeholder="Información de contacto"
                    value={newGuestContact}
                    onChange={(e) => setNewGuestContact(e.target.value)}
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