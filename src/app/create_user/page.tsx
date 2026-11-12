"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Button from "@/components/Button";
import HeaderXuchil from "@/components/HeaderXuchil";
import Modal from "@/components/Modal";
import styles from "../user/User.module.css"; 

interface SystemUser {
  id: number;
  displayName: string;
  contactInfo: string | null;
  role: "empleado" | "temporal";
  isActive: boolean;
  expiresAt: string | null;
}

const CreateUserPage = () => {
  const router = useRouter();
  const [userType, setUserType] = useState<"permanente" | "temporal">("permanente");
  const [loading, setLoading] = useState(false);
  const [usersList, setUsersList] = useState<SystemUser[]>([]);

  const [tempFullName, setTempFullName] = useState("");
  const [tempEmail, setTempEmail] = useState("");
  const [tempPhone, setTempPhone] = useState("");
  const [tempPassword, setTempPassword] = useState("");
  const [tempDurationDays, setTempDurationDays] = useState("7");

  const [permName, setPermName] = useState("");
  const [permLastNameP, setPermLastNameP] = useState("");
  const [permLastNameM, setPermLastNameM] = useState("");
  const [permPhone, setPermPhone] = useState("");
  const [permEmail, setPermEmail] = useState("");
  const [permPassword, setPermPassword] = useState("");
  const [permConfirmPassword, setPermConfirmPassword] = useState("");


  const [notificationModal, setNotificationModal] = useState({ open: false, title: "", message: "", error: false });
  
  const [selectedUser, setSelectedUser] = useState<SystemUser | null>(null);
  const [editIsActive, setEditIsActive] = useState(true);
  const [editRole, setEditRole] = useState<"empleado" | "temporal">("empleado");
  const [additionalDays, setAdditionalDays] = useState("0");
  const [editPassword, setEditPassword] = useState("");
  const [editConfirmPassword, setEditConfirmPassword] = useState("");

  useEffect(() => {
    loadSystemUsers();
  }, []);

  const loadSystemUsers = async () => {
    try {
      const response = await fetch("/api/users", { credentials: "include" });
      if (response.ok) {
        const dataAuthUsers = await response.json();
        
        if (dataAuthUsers && dataAuthUsers.length > 0) {
          const ahora = new Date();

          const usuariosMapeados = dataAuthUsers.map((user: any) => {
            const nombreReal = user.worker?.fullName || user.fullName || "Trabajador sin nombre";
            const contactoReal = user.email || (user.worker?.phone ? `Tel: ${user.worker.phone}` : "Sin contacto");
            
            const rawExpiresAt = user.worker?.expiresAt || null;
            const esTemporal = user.worker?.roleId === null || user.role === "temporal" || !!rawExpiresAt;

            let cuentaActiva = user.isActive ?? user.worker?.isActive ?? true;
            if (rawExpiresAt && new Date(rawExpiresAt) < ahora) {
              cuentaActiva = false;
            }

            return {
              id: user.id,
              displayName: nombreReal,
              contactInfo: contactoReal,
              role: esTemporal ? "temporal" : "empleado",
              isActive: cuentaActiva,
              expiresAt: rawExpiresAt
            };
          });

          setUsersList(usuariosMapeados);
          return;
        }
      }
    } catch (e) {
      console.error("Error al mapear con la estructura AuthUser:", e);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const isTemp = userType === "temporal";
      const bodyPayload = isTemp
        ? {
            fullName: tempFullName.trim(),
            phone: tempPhone.trim() || null,
            email: tempEmail.trim(),
            password: tempPassword || undefined,
            temporaryDurationDays: Number.parseInt(tempDurationDays, 10) || 7,
            roleId: null
          }
        : {
            fullName: `${permName.trim()} ${permLastNameP.trim()} ${permLastNameM.trim()}`.trim(),
            phone: permPhone.trim() || null,
            email: permEmail.trim(),
            password: permPassword,
            temporaryDurationDays: null,
            roleId: 1
          };

      const response = await fetch("/api/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(bodyPayload),
      });

      if (!response.ok) {
        setNotificationModal({ open: true, title: "Error", message: "No se pudo registrar.", error: true });
        return;
      }

      setNotificationModal({ open: true, title: "Éxito", message: "Usuario guardado.", error: false });
      setTempFullName(""); setTempEmail(""); setTempPhone(""); setTempPassword("");
      setPermName(""); setPermLastNameP(""); setPermLastNameM(""); setPermPhone(""); setPermEmail(""); setPermPassword(""); setPermConfirmPassword("");
      await loadSystemUsers();
    } catch {
      setNotificationModal({ open: true, title: "Error", message: "Error de conexión.", error: true });
    } finally {
      setLoading(false);
    }
  };

  const openEditModal = (user: SystemUser) => {
    setSelectedUser(user);
    setEditIsActive(user.isActive);
    setEditRole(user.role);
    setAdditionalDays("0");
    setEditPassword("");
    setEditConfirmPassword("");
  };

  // Panel renders at the bottom of the page; bring it into view when a user is picked.
  useEffect(() => {
    if (selectedUser) document.getElementById("edit-panel")?.scrollIntoView({ behavior: "smooth" });
  }, [selectedUser]);

const handleUpdateUser = async () => {
    if (!selectedUser) return;
    if (editPassword && editPassword.length < 8) {
      setNotificationModal({ open: true, title: "Error", message: "La nueva contraseña debe tener al menos 8 caracteres.", error: true });
      return;
    }
    if (editPassword !== editConfirmPassword) {
      setNotificationModal({ open: true, title: "Error", message: "Las contraseñas no coinciden.", error: true });
      return;
    }
    setLoading(true);

    try {
      const response = await fetch("/api/users", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          userId: selectedUser.id,
          isActive: editIsActive,
          role: editRole,
          additionalDays: Number.parseInt(additionalDays, 10) || 0,
          newPassword: editPassword || undefined,
        }),
      });

      if (!response.ok) {
        setNotificationModal({ open: true, title: "Error", message: "No se pudieron guardar los cambios en el servidor.", error: true });
        return;
      }

      // Si todo sale bien, cerramos el panel de edición y disparamos alerta en texto plano
      setSelectedUser(null);
      setNotificationModal({ open: true, title: "Actualizado", message: "Los datos del trabajador se actualizaron de manera correcta.", error: false });
      await loadSystemUsers();
    } catch {
      setNotificationModal({ open: true, title: "Error de red", message: "Fallo de comunicación con la base de datos.", error: true });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page" style={{ minHeight: "100vh", paddingBottom: "60px" }}>
      <HeaderXuchil />
      <div style={{ padding: "20px", maxWidth: "480px", margin: "0 auto" }}>
        
        <button onClick={() => router.push("/user")} style={{ background: "none", border: "none", color: "#1C352D", cursor: "pointer", marginBottom: "15px", fontWeight: "bold" }}>
          ← Volver al Perfil
        </button>

        <h1 style={{ textAlign: "center", color: "#1C352D", marginBottom: "20px", fontSize: "1.8rem" }}>
          Administración de Personal
        </h1>

        {/* Selector de Pestañas de Registro */}
        <div style={{ display: "flex", gap: "10px", marginBottom: "25px" }}>
          <button type="button" onClick={() => setUserType("permanente")} style={{ flex: 1, padding: "10px", borderRadius: "8px", border: userType === "permanente" ? "2px solid #1C352D" : "1px solid #cbd5e1", backgroundColor: userType === "permanente" ? "#e6f4ea" : "#fff", color: "#1C352D", fontWeight: "bold" }}>Permanente</button>
          <button type="button" onClick={() => setUserType("temporal")} style={{ flex: 1, padding: "10px", borderRadius: "8px", border: userType === "temporal" ? "2px solid #1C352D" : "1px solid #cbd5e1", backgroundColor: userType === "temporal" ? "#e6f4ea" : "#fff", color: "#1C352D", fontWeight: "bold" }}>Temporal</button>
        </div>

        {/* Formulario de Altas */}
        <form onSubmit={handleRegister} style={{ backgroundColor: "#fff", padding: "20px", borderRadius: "16px", border: "1px solid #e2e8f0", boxShadow: "0 4px 6px -1px rgba(0,0,0,0.05)" }}>
          {userType === "permanente" ? (
            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              <h3 style={{ color: "#1C352D", margin: 0 }}>Crear nuevo usuario</h3>
              <input type="text" placeholder="Nombre *" value={permName} onChange={(e) => setPermName(e.target.value)} className={styles.guestInput} required />
              <input type="text" placeholder="Apellido Paterno *" value={permLastNameP} onChange={(e) => setPermLastNameP(e.target.value)} className={styles.guestInput} required />
              <input type="text" placeholder="Apellido Materno" value={permLastNameM} onChange={(e) => setPermLastNameM(e.target.value)} className={styles.guestInput} />
              <input type="text" placeholder="Teléfono" value={permPhone} onChange={(e) => setPermPhone(e.target.value)} className={styles.guestInput} />
              <input type="email" placeholder="Correo *" value={permEmail} onChange={(e) => setPermEmail(e.target.value)} className={styles.guestInput} required />
              <input type="password" placeholder="Contraseña *" value={permPassword} onChange={(e) => setPermPassword(e.target.value)} className={styles.guestInput} required />
              <input type="password" placeholder="Confirmar Contraseña *" value={permConfirmPassword} onChange={(e) => setPermConfirmPassword(e.target.value)} className={styles.guestInput} required />
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              <h3 style={{ color: "#1C352D", margin: 0 }}>Nuevo trabajador temporal</h3>
              <input type="text" placeholder="Nombre completo *" value={tempFullName} onChange={(e) => setTempFullName(e.target.value)} className={styles.guestInput} required />
              <input type="email" placeholder="Correo electrónico *" value={tempEmail} onChange={(e) => setTempEmail(e.target.value)} className={styles.guestInput} required />
              <input type="text" placeholder="Teléfono" value={tempPhone} onChange={(e) => setTempPhone(e.target.value)} className={styles.guestInput} />
              <input type="password" placeholder="Contraseña temporal" value={tempPassword} onChange={(e) => setTempPassword(e.target.value)} className={styles.guestInput} />
              <label style={{ fontSize: "0.8rem", color: "#666" }}>Duración en días *</label>
              <input type="number" min="1" value={tempDurationDays} onChange={(e) => setTempDurationDays(e.target.value)} className={styles.guestInput} required />
            </div>
          )}
          <div style={{ marginTop: "20px" }}>
            <Button size="regular" action="primary" type="submit" style={{ width: "100%" }}>
              {loading ? "Procesando..." : userType === "permanente" ? "Crear usuario" : "Crear trabajador temporal"}
            </Button>
          </div>
        </form>

        {/* Lista de Personal Registrado */}
        <div style={{ marginTop: "35px" }}>
          <h2 style={{ fontSize: "1.2rem", color: "#1C352D", fontWeight: "bold", marginBottom: "15px" }}>Personal Registrado</h2>
          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            {usersList.map((user) => (
              <div key={user.id} style={{ backgroundColor: "#ffffff", border: "1px solid #e2e8f0", borderLeft: user.role !== "temporal" ? "6px solid #1C352D" : "6px solid #d97706", borderRadius: "12px", padding: "16px", display: "flex", justifyContent: "space-between", alignItems: "center", opacity: user.isActive ? 1 : 0.45 }}>
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <span style={{ fontWeight: "bold", color: "#1C352D", textDecoration: user.isActive ? "none" : "line-through" }}>{user.displayName}</span>
                    <span style={{ fontSize: "10px", padding: "2px 6px", borderRadius: "4px", fontWeight: "bold", backgroundColor: user.role !== "temporal" ? "#e6f4ea" : "#fef3c7", color: user.role !== "temporal" ? "#1C352D" : "#b45309" }}>{user.role === "temporal" ? "Temporal" : "Permanente"}</span>
                    {!user.isActive && <span style={{ fontSize: "10px", padding: "2px 6px", borderRadius: "4px", backgroundColor: "#fee2e2", color: "#991b1b", fontWeight: "bold" }}>Inactivo</span>}
                  </div>
                  {user.contactInfo && <div style={{ fontSize: "0.85rem", color: "#64748b", marginTop: "4px" }}>{user.contactInfo}</div>}
                  {user.role === "temporal" && user.expiresAt && user.isActive && (
                    <div style={{ fontSize: "0.75rem", color: "#b45309", marginTop: "4px" }}>Vence el: {new Date(user.expiresAt).toLocaleDateString("es-MX")}</div>
                  )}
                </div>
                <button type="button" onClick={() => openEditModal(user)} style={{ backgroundColor: "#f1f5f9", color: "#1e293b", border: "1px solid #cbd5e1", borderRadius: "8px", padding: "6px 14px", fontSize: "0.8rem", fontWeight: "600", cursor: "pointer" }}>Editar</button>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* 🛠️ PANEL DE EDICIÓN FLUIDO (A salvo de TypeScript) */}
        {selectedUser && (
          <div id="edit-panel" style={{ marginTop: "30px", backgroundColor: "#f8fafc", padding: "20px", borderRadius: "16px", border: "2px solid #cbd5e1" }}>
            <h3 style={{ color: "#1C352D", margin: "0 0 15px 0", fontSize: "1.1rem" }}>
              Editando a: <span style={{ fontWeight: "bold" }}>{selectedUser.displayName}</span>
            </h3>

            <div style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
              
              {/* Campo 1: Estado del Trabajador */}
              <div style={{ display: "flex", flexDirection: "column", gap: "5px" }}>
                <label style={{ fontWeight: "bold", fontSize: "0.85rem", color: "#334155" }}>Estado de Cuenta:</label>
                <select 
                  value={editIsActive ? "true" : "false"} 
                  onChange={(e) => setEditIsActive(e.target.value === "true")} 
                  style={{ padding: "10px", borderRadius: "8px", border: "1px solid #cbd5e1", backgroundColor: "#fff" }}
                >
                  <option value="true">Activo / Habilitado</option>
                  <option value="false">Inactivo / Desactivado</option>
                </select>
              </div>

              {/* Campo 2: Transformar Tipo de Contrato */}
              <div style={{ display: "flex", flexDirection: "column", gap: "5px" }}>
                <label style={{ fontWeight: "bold", fontSize: "0.85rem", color: "#334155" }}>Tipo de Personal:</label>
                <select 
                  value={editRole} 
                  onChange={(e) => setEditRole(e.target.value as any)} 
                  style={{ padding: "10px", borderRadius: "8px", border: "1px solid #cbd5e1", backgroundColor: "#fff" }}
                >
                  <option value="empleado">Permanente (Fijo)</option>
                  <option value="temporal">Temporal (Vigencia limitada)</option>
                </select>
              </div>

              {/* Campo 3: Añadir más tiempo a un temporal */}
              {editRole === "temporal" && (
                <div style={{ display: "flex", flexDirection: "column", gap: "5px", backgroundColor: "#fff7ed", padding: "12px", borderRadius: "8px", border: "1px solid #ffedd5" }}>
                  <label style={{ fontWeight: "bold", fontSize: "0.85rem", color: "#c2410c" }}>Extender tiempo (Días adicionales):</label>
                  <input 
                    type="number" 
                    min="0" 
                    value={additionalDays} 
                    onChange={(e) => setAdditionalDays(e.target.value)} 
                    style={{ padding: "8px", borderRadius: "6px", border: "1px solid #cbd5e1" }} 
                  />
                </div>
              )}

              {/* Campo 4: Restablecer contraseña (opcional) */}
              <div style={{ display: "flex", flexDirection: "column", gap: "5px" }}>
                <label htmlFor="edit-password" style={{ fontWeight: "bold", fontSize: "0.85rem", color: "#334155" }}>Restablecer contraseña:</label>
                <input
                  id="edit-password"
                  type="password"
                  autoComplete="new-password"
                  placeholder="Dejar vacío para no cambiarla"
                  value={editPassword}
                  onChange={(e) => setEditPassword(e.target.value)}
                  style={{ padding: "10px", borderRadius: "8px", border: "1px solid #cbd5e1", backgroundColor: "#fff" }}
                />
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "5px" }}>
                <label htmlFor="edit-confirm-password" style={{ fontWeight: "bold", fontSize: "0.85rem", color: "#334155" }}>Confirmar contraseña:</label>
                <input
                  id="edit-confirm-password"
                  type="password"
                  autoComplete="new-password"
                  value={editConfirmPassword}
                  onChange={(e) => setEditConfirmPassword(e.target.value)}
                  style={{ padding: "10px", borderRadius: "8px", border: "1px solid #cbd5e1", backgroundColor: "#fff" }}
                />
              </div>

              {/* Botones de acción del panel */}
              <div style={{ display: "flex", gap: "10px", marginTop: "10px" }}>
                <button
                  type="button"
                  onClick={() => setSelectedUser(null)}
                  style={{ flex: 1, padding: "10px", borderRadius: "8px", border: "1px solid #cbd5e1", backgroundColor: "#fff", cursor: "pointer", fontWeight: "600" }}
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={handleUpdateUser}
                  style={{ flex: 1, padding: "10px", borderRadius: "8px", border: "none", backgroundColor: "#1C352D", color: "#fff", cursor: "pointer", fontWeight: "600" }}
                >
                  {loading ? "Guardando..." : "Guardar Cambios"}
                </button>
              </div>

            </div>
          </div>
        )}



      <Modal open={notificationModal.open} title={notificationModal.title} message={notificationModal.message} confirmText="Aceptar" onlyConfirm onConfirm={() => setNotificationModal((prev) => ({ ...prev, open: false }))} danger={notificationModal.error} />
    </div>
  );
};

export default CreateUserPage;