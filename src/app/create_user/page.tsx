"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Eye, EyeOff, Info } from "lucide-react";
import Button from "@/components/Button";
import Modal from "@/components/Modal";
import styles from "./CreateUser.module.css";

interface SystemUser {
  id: number;
  displayName: string;
  contactInfo: string | null;
  role: "empleado" | "temporal";
  isActive: boolean;
  expiresAt: string | null;
}

interface ApiAuthUser {
  id: number;
  email?: string | null;
  fullName?: string | null;
  role?: string | null;
  isActive?: boolean;
  worker?: {
    fullName?: string | null;
    phone?: string | null;
    roleId?: number | null;
    expiresAt?: string | null;
    isActive?: boolean;
  } | null;
}

const isPasswordComplex = (pwd: string) =>
  /(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}/.test(pwd);

const isPhoneValid = (phone: string) =>
  !phone.trim() || phone.replace(/\D/g, "").length >= 10;

const CreateUserPage = () => {
  const router = useRouter();
  const [userType, setUserType] = useState<"permanente" | "temporal">("permanente");
  const [loading, setLoading] = useState(false);
  const [usersList, setUsersList] = useState<SystemUser[]>([]);
  const [formError, setFormError] = useState<string | null>(null);

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

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [notificationModal, setNotificationModal] = useState({
    open: false,
    title: "",
    message: "",
    error: false,
  });

  const [selectedUser, setSelectedUser] = useState<SystemUser | null>(null);
  const [editIsActive, setEditIsActive] = useState(true);
  const [editRole, setEditRole] = useState<"empleado" | "temporal">("empleado");
  const [additionalDays, setAdditionalDays] = useState("0");

  // Validations from feat/users-validations
  const passwordTooShort = permPassword.length > 0 && permPassword.length < 8;
  const passwordMissingComplexity =
    permPassword.length >= 8 && !isPasswordComplex(permPassword);
  const passwordsDoNotMatch =
    permConfirmPassword.length > 0 && permPassword !== permConfirmPassword;
  const permPasswordsReady =
    permPassword.length >= 8 &&
    isPasswordComplex(permPassword) &&
    permPassword === permConfirmPassword;

  const tempPasswordTooShort =
    tempPassword.trim().length > 0 && tempPassword.trim().length < 8;

  const loadSystemUsers = async () => {
    try {
      const response = await fetch("/api/users", { credentials: "include" });
      if (response.ok) {
        const dataAuthUsers = await response.json();

        if (Array.isArray(dataAuthUsers)) {
          const ahora = new Date();

          const usuariosMapeados = (dataAuthUsers as ApiAuthUser[]).map((user): SystemUser => {
            const nombreReal =
              user.worker?.fullName || user.fullName || "Trabajador sin nombre";
            const contactoReal =
              user.email ||
              (user.worker?.phone ? `Tel: ${user.worker.phone}` : "Sin contacto");

            const rawExpiresAt = user.worker?.expiresAt || null;
            const esTemporal =
              user.worker?.roleId === null ||
              user.role === "temporal" ||
              Boolean(rawExpiresAt);

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
              expiresAt: rawExpiresAt,
            };
          });

          setUsersList(usuariosMapeados);
        }
      }
    } catch (e) {
      console.error("Error al mapear con la estructura AuthUser:", e);
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void loadSystemUsers();
  }, []);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    const isTemp = userType === "temporal";

    if (isTemp) {
      if (!tempFullName.trim() || !tempEmail.trim()) {
        setFormError("Completa el nombre completo y el correo del trabajador temporal.");
        return;
      }
      if (!isPhoneValid(tempPhone)) {
        setFormError("El teléfono debe tener al menos 10 dígitos.");
        return;
      }
      if (tempPasswordTooShort) {
        setFormError("La contraseña temporal debe tener al menos 8 caracteres (o déjala vacía para generarla automáticamente).");
        return;
      }
      const parsedDays = Number.parseInt(tempDurationDays, 10);
      if (Number.isNaN(parsedDays) || parsedDays < 1) {
        setFormError("La duración en días debe ser de al menos 1 día.");
        return;
      }
    } else {
      if (!permName.trim() || !permLastNameP.trim() || !permEmail.trim()) {
        setFormError("Completa todos los campos obligatorios (*).");
        return;
      }
      if (!isPhoneValid(permPhone)) {
        setFormError("El teléfono debe tener al menos 10 dígitos.");
        return;
      }
      if (permPassword.length < 8) {
        setFormError("La contraseña debe tener al menos 8 caracteres.");
        return;
      }
      if (!isPasswordComplex(permPassword)) {
        setFormError("La contraseña debe incluir al menos una mayúscula, una minúscula y un número.");
        return;
      }
      if (permPassword !== permConfirmPassword) {
        setFormError("Las contraseñas no coinciden.");
        return;
      }
    }

    setLoading(true);
    try {
      const bodyPayload = isTemp
        ? {
            fullName: tempFullName.trim(),
            phone: tempPhone.trim() || null,
            email: tempEmail.trim(),
            password: tempPassword.trim() || undefined,
            temporaryDurationDays: Number.parseInt(tempDurationDays, 10) || 7,
            roleId: null,
          }
        : {
            fullName: `${permName.trim()} ${permLastNameP.trim()} ${permLastNameM.trim()}`.trim(),
            phone: permPhone.trim() || null,
            email: permEmail.trim(),
            password: permPassword,
            temporaryDurationDays: null,
            roleId: 1,
          };

      const response = await fetch("/api/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(bodyPayload),
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        setNotificationModal({
          open: true,
          title: "Error",
          message: data.error || "No se pudo registrar el usuario.",
          error: true,
        });
        return;
      }

      const successMessage =
        isTemp && data.temporaryPassword
          ? `Trabajador temporal registrado.\nCorreo: ${data.email}\nContraseña de acceso: ${data.temporaryPassword}\nVence el: ${
              data.expiresAt
                ? new Date(data.expiresAt).toLocaleDateString("es-MX")
                : `${tempDurationDays} días`
            }`
          : "Usuario guardado correctamente.";

      setNotificationModal({
        open: true,
        title: "Éxito",
        message: successMessage,
        error: false,
      });

      setTempFullName("");
      setTempEmail("");
      setTempPhone("");
      setTempPassword("");
      setTempDurationDays("7");
      setPermName("");
      setPermLastNameP("");
      setPermLastNameM("");
      setPermPhone("");
      setPermEmail("");
      setPermPassword("");
      setPermConfirmPassword("");
      await loadSystemUsers();
    } catch {
      setNotificationModal({
        open: true,
        title: "Error",
        message: "Error de conexión.",
        error: true,
      });
    } finally {
      setLoading(false);
    }
  };

  const openEditModal = (user: SystemUser) => {
    setSelectedUser(user);
    setEditIsActive(user.isActive);
    setEditRole(user.role);
    const isExpiredOrMissing =
      !user.expiresAt || new Date(user.expiresAt) <= new Date();
    setAdditionalDays(user.role === "temporal" && isExpiredOrMissing ? "7" : "0");
  };

  const handleUpdateUser = async () => {
    if (!selectedUser) return;
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
        }),
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        setNotificationModal({
          open: true,
          title: "Error",
          message: data.error || "No se pudieron guardar los cambios en el servidor.",
          error: true,
        });
        return;
      }

      setSelectedUser(null);
      setNotificationModal({
        open: true,
        title: "Actualizado",
        message: "Los datos del trabajador se actualizaron de manera correcta.",
        error: false,
      });
      await loadSystemUsers();
    } catch {
      setNotificationModal({
        open: true,
        title: "Error de red",
        message: "Fallo de comunicación con la base de datos.",
        error: true,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.wrapper}>
      <header className={styles.head}>
        <button
          type="button"
          className={styles.back}
          onClick={() => router.push("/user")}
          aria-label="Volver al perfil"
        >
          <ArrowLeft size={20} />
        </button>

        <h1 className={styles.title}>Administración de Personal</h1>
      </header>

      <div className={styles.typeTabs}>
        <button
          type="button"
          className={`${styles.typeTab} ${
            userType === "permanente" ? styles.typeTabActive : ""
          }`}
          onClick={() => {
            setUserType("permanente");
            setFormError(null);
          }}
        >
          Permanente
        </button>
        <button
          type="button"
          className={`${styles.typeTab} ${
            userType === "temporal" ? styles.typeTabActive : ""
          }`}
          onClick={() => {
            setUserType("temporal");
            setFormError(null);
          }}
        >
          Temporal
        </button>
      </div>

      {formError && (
        <p
          role="alert"
          style={{
            color: "#b42318",
            backgroundColor: "#fef2f2",
            border: "1px solid #fecaca",
            borderRadius: "10px",
            padding: "10px 14px",
            fontSize: "0.88rem",
            fontWeight: 700,
            margin: 0,
          }}
        >
          {formError}
        </p>
      )}

      <form onSubmit={handleRegister} className={styles.form}>
        <p className={styles.sectionLabel}>
          {userType === "permanente" ? "Datos del usuario" : "Nuevo trabajador temporal"}
        </p>

        {userType === "permanente" ? (
          <>
            <section className={styles.card}>
              <div className={styles.field}>
                <label className={styles.label} htmlFor="perm-nombre">
                  Nombre *
                </label>
                <input
                  id="perm-nombre"
                  type="text"
                  className={styles.input}
                  placeholder="Nombre *"
                  value={permName}
                  onChange={(e) => setPermName(e.target.value)}
                  required
                />
              </div>

              <div className={styles.field}>
                <label className={styles.label} htmlFor="perm-apellido-p">
                  Apellido paterno *
                </label>
                <input
                  id="perm-apellido-p"
                  type="text"
                  className={styles.input}
                  placeholder="Apellido Paterno *"
                  value={permLastNameP}
                  onChange={(e) => setPermLastNameP(e.target.value)}
                  required
                />
              </div>

              <div className={styles.field}>
                <label className={styles.label} htmlFor="perm-apellido-m">
                  Apellido materno
                </label>
                <input
                  id="perm-apellido-m"
                  type="text"
                  className={styles.input}
                  placeholder="Apellido Materno"
                  value={permLastNameM}
                  onChange={(e) => setPermLastNameM(e.target.value)}
                />
              </div>

              <div className={styles.field}>
                <label className={styles.label} htmlFor="perm-telefono">
                  Teléfono
                </label>
                <input
                  id="perm-telefono"
                  type="tel"
                  inputMode="tel"
                  className={styles.input}
                  placeholder="Teléfono (10 dígitos)"
                  value={permPhone}
                  onChange={(e) => setPermPhone(e.target.value)}
                />
                {!isPhoneValid(permPhone) && (
                  <p role="alert" style={{ color: "#b42318", fontSize: "0.82rem", margin: 0 }}>
                    El teléfono debe contener al menos 10 dígitos.
                  </p>
                )}
              </div>

              <div className={styles.field}>
                <label className={styles.label} htmlFor="perm-correo">
                  Correo electrónico *
                </label>
                <input
                  id="perm-correo"
                  type="email"
                  className={styles.input}
                  placeholder="Correo *"
                  value={permEmail}
                  onChange={(e) => setPermEmail(e.target.value)}
                  required
                />
              </div>
            </section>

            <p className={styles.sectionLabel}>Contraseña</p>

            <section className={styles.card}>
              <div className={styles.field}>
                <label className={styles.label} htmlFor="perm-password">
                  Contraseña *
                </label>
                <div className={styles.passwordWrap}>
                  <input
                    id="perm-password"
                    type={showPassword ? "text" : "password"}
                    className={styles.input}
                    placeholder="Contraseña *"
                    value={permPassword}
                    onChange={(e) => setPermPassword(e.target.value)}
                    required
                  />
                  <button
                    type="button"
                    className={styles.reveal}
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                {passwordTooShort && (
                  <p role="alert" style={{ color: "#b42318", fontSize: "0.84rem", margin: "2px 0 0" }}>
                    La contraseña debe tener al menos 8 caracteres.
                  </p>
                )}
                {passwordMissingComplexity && (
                  <p role="alert" style={{ color: "#b42318", fontSize: "0.84rem", margin: "2px 0 0" }}>
                    Incluye al menos una letra mayúscula, una minúscula y un número.
                  </p>
                )}
                <p className={styles.hint}>
                  Al menos 8 caracteres, una mayúscula, una minúscula y un número.
                </p>
              </div>

              <div className={styles.field}>
                <label className={styles.label} htmlFor="perm-confirm-password">
                  Confirmar contraseña *
                </label>
                <div className={styles.passwordWrap}>
                  <input
                    id="perm-confirm-password"
                    type={showConfirmPassword ? "text" : "password"}
                    className={styles.input}
                    placeholder="Confirmar Contraseña *"
                    value={permConfirmPassword}
                    onChange={(e) => setPermConfirmPassword(e.target.value)}
                    required
                  />
                  <button
                    type="button"
                    className={styles.reveal}
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    aria-label={showConfirmPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                  >
                    {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                {passwordsDoNotMatch && (
                  <p role="alert" style={{ color: "#b42318", fontSize: "0.84rem", margin: "2px 0 0" }}>
                    Las contraseñas no coinciden.
                  </p>
                )}
              </div>
            </section>
          </>
        ) : (
          <>
            <div
              role="note"
              style={{
                display: "flex",
                alignItems: "flex-start",
                gap: "10px",
                padding: "12px 14px",
                borderRadius: "12px",
                backgroundColor: "#fffbeb",
                border: "1px solid #fde68a",
                color: "#92400e",
                fontSize: "0.85rem",
                lineHeight: 1.45,
              }}
            >
              <Info size={18} style={{ flexShrink: 0, marginTop: "2px" }} />
              <div>
                <strong>¿Cómo funcionan las cuentas temporales?</strong>
                <p style={{ margin: "4px 0 0" }}>
                  El trabajador podrá iniciar sesión durante los días indicados. Al vencer el plazo, su acceso se desactiva automáticamente sin borrar su historial en bitácora. Si dejas la contraseña en blanco, el sistema generará una y te la mostrará al guardar.
                </p>
              </div>
            </div>

            <section className={styles.card}>
              <div className={styles.field}>
                <label className={styles.label} htmlFor="temp-nombre">
                  Nombre completo *
                </label>
                <input
                  id="temp-nombre"
                  type="text"
                  className={styles.input}
                  placeholder="Nombre completo *"
                  value={tempFullName}
                  onChange={(e) => setTempFullName(e.target.value)}
                  required
                />
              </div>

              <div className={styles.field}>
                <label className={styles.label} htmlFor="temp-correo">
                  Correo electrónico *
                </label>
                <input
                  id="temp-correo"
                  type="email"
                  className={styles.input}
                  placeholder="Correo electrónico *"
                  value={tempEmail}
                  onChange={(e) => setTempEmail(e.target.value)}
                  required
                />
              </div>

              <div className={styles.field}>
                <label className={styles.label} htmlFor="temp-telefono">
                  Teléfono
                </label>
                <input
                  id="temp-telefono"
                  type="tel"
                  inputMode="tel"
                  className={styles.input}
                  placeholder="Teléfono (10 dígitos)"
                  value={tempPhone}
                  onChange={(e) => setTempPhone(e.target.value)}
                />
                {!isPhoneValid(tempPhone) && (
                  <p role="alert" style={{ color: "#b42318", fontSize: "0.82rem", margin: 0 }}>
                    El teléfono debe contener al menos 10 dígitos.
                  </p>
                )}
              </div>

              <div className={styles.field}>
                <label className={styles.label} htmlFor="temp-password">
                  Contraseña temporal (opcional)
                </label>
                <div className={styles.passwordWrap}>
                  <input
                    id="temp-password"
                    type={showPassword ? "text" : "password"}
                    className={styles.input}
                    placeholder="Déjala vacía para autogenerar o escribe mín. 8 caracteres"
                    value={tempPassword}
                    onChange={(e) => setTempPassword(e.target.value)}
                  />
                  <button
                    type="button"
                    className={styles.reveal}
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                {tempPasswordTooShort && (
                  <p role="alert" style={{ color: "#b42318", fontSize: "0.84rem", margin: "2px 0 0" }}>
                    La contraseña debe tener al menos 8 caracteres.
                  </p>
                )}
              </div>

              <div className={styles.field}>
                <label className={styles.label} htmlFor="temp-dias">
                  Duración en días *
                </label>
                <input
                  id="temp-dias"
                  type="number"
                  min="1"
                  className={styles.input}
                  value={tempDurationDays}
                  onChange={(e) => setTempDurationDays(e.target.value)}
                  required
                />
              </div>
            </section>
          </>
        )}

        <div className={styles.actions}>
          <Button size="regular" action="outline" type="button" onClick={() => router.push("/user")}>
            Cancelar
          </Button>
          <Button
            size="regular"
            action="primary"
            type="submit"
            disabled={
              loading ||
              (userType === "permanente" ? !permPasswordsReady : tempPasswordTooShort)
            }
          >
            {loading
              ? "Procesando..."
              : userType === "permanente"
              ? "Crear usuario"
              : "Crear trabajador temporal"}
          </Button>
        </div>
      </form>

      {/* Lista de Personal Registrado */}
      <div style={{ marginTop: "20px" }}>
        <p className={styles.sectionLabel} style={{ marginBottom: "12px" }}>
          Personal Registrado
        </p>
        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          {usersList.map((user) => {
            const isExpired =
              user.role === "temporal" &&
              Boolean(user.expiresAt) &&
              new Date(user.expiresAt!) < new Date();

            return (
              <div
                key={user.id}
                style={{
                  backgroundColor: "var(--color-field)",
                  border: "1px solid var(--color-gray-light)",
                  borderLeft:
                    user.role !== "temporal"
                      ? "6px solid var(--color-green-dark)"
                      : "6px solid #d97706",
                  borderRadius: "12px",
                  padding: "16px",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  opacity: user.isActive ? 1 : 0.55,
                }}
              >
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
                    <span
                      style={{
                        fontWeight: "bold",
                        color: "var(--color-text-dark)",
                        textDecoration: user.isActive ? "none" : "line-through",
                      }}
                    >
                      {user.displayName}
                    </span>
                    <span
                      style={{
                        fontSize: "10px",
                        padding: "2px 6px",
                        borderRadius: "4px",
                        fontWeight: "bold",
                        backgroundColor: user.role !== "temporal" ? "#e6f4ea" : "#fef3c7",
                        color: user.role !== "temporal" ? "#1C352D" : "#b45309",
                      }}
                    >
                      {user.role === "temporal" ? "Temporal" : "Permanente"}
                    </span>
                    {!user.isActive && (
                      <span
                        style={{
                          fontSize: "10px",
                          padding: "2px 6px",
                          borderRadius: "4px",
                          backgroundColor: "#fee2e2",
                          color: "#991b1b",
                          fontWeight: "bold",
                        }}
                      >
                        {isExpired ? "Vencido" : "Inactivo"}
                      </span>
                    )}
                  </div>
                  {user.contactInfo && (
                    <div style={{ fontSize: "0.85rem", color: "#64748b", marginTop: "4px" }}>
                      {user.contactInfo}
                    </div>
                  )}
                  {user.role === "temporal" && user.expiresAt && (
                    <div
                      style={{
                        fontSize: "0.75rem",
                        color: isExpired ? "#991b1b" : "#b45309",
                        marginTop: "4px",
                      }}
                    >
                      {isExpired ? "Venció el: " : "Vence el: "}
                      {new Date(user.expiresAt).toLocaleDateString("es-MX")}
                    </div>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => openEditModal(user)}
                  style={{
                    backgroundColor: "#f1f5f9",
                    color: "#1e293b",
                    border: "1px solid #cbd5e1",
                    borderRadius: "8px",
                    padding: "6px 14px",
                    fontSize: "0.8rem",
                    fontWeight: "600",
                    cursor: "pointer",
                  }}
                >
                  Editar
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* PANEL DE EDICIÓN FLUIDO */}
      {selectedUser && (
        <div
          style={{
            marginTop: "20px",
            backgroundColor: "var(--color-field)",
            padding: "20px",
            borderRadius: "16px",
            border: "2px solid var(--color-gray-light)",
          }}
        >
          <h3 style={{ color: "var(--color-green-dark)", margin: "0 0 15px 0", fontSize: "1.1rem" }}>
            Editando a: <span style={{ fontWeight: "bold" }}>{selectedUser.displayName}</span>
          </h3>

          <div style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
            <div style={{ display: "flex", flexDirection: "column", gap: "5px" }}>
              <label style={{ fontWeight: "bold", fontSize: "0.85rem", color: "#334155" }}>
                Estado de Cuenta:
              </label>
              <select
                value={editIsActive ? "true" : "false"}
                onChange={(e) => setEditIsActive(e.target.value === "true")}
                className={styles.input}
              >
                <option value="true">Activo / Habilitado</option>
                <option value="false">Inactivo / Desactivado</option>
              </select>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "5px" }}>
              <label style={{ fontWeight: "bold", fontSize: "0.85rem", color: "#334155" }}>
                Tipo de Personal:
              </label>
              <select
                value={editRole}
                onChange={(e) => {
                  const role = e.target.value;
                  if (role === "empleado" || role === "temporal") {
                    setEditRole(role);
                    if (
                      role === "temporal" &&
                      (!selectedUser.expiresAt || new Date(selectedUser.expiresAt) <= new Date())
                    ) {
                      setAdditionalDays("7");
                    }
                  }
                }}
                className={styles.input}
              >
                <option value="empleado">Permanente (Fijo)</option>
                <option value="temporal">Temporal (Vigencia limitada)</option>
              </select>
            </div>

            {editRole === "temporal" && (
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "5px",
                  backgroundColor: "#fff7ed",
                  padding: "12px",
                  borderRadius: "8px",
                  border: "1px solid #ffedd5",
                }}
              >
                <label style={{ fontWeight: "bold", fontSize: "0.85rem", color: "#c2410c" }}>
                  Extender tiempo (Días adicionales a partir de hoy o de su fecha de vencimiento):
                </label>
                <input
                  type="number"
                  min="0"
                  value={additionalDays}
                  onChange={(e) => setAdditionalDays(e.target.value)}
                  className={styles.input}
                />
              </div>
            )}

            <div className={styles.actions}>
              <Button
                size="regular"
                action="outline"
                type="button"
                onClick={() => setSelectedUser(null)}
              >
                Cancelar
              </Button>
              <Button size="regular" action="primary" type="button" onClick={handleUpdateUser}>
                {loading ? "Guardando..." : "Guardar Cambios"}
              </Button>
            </div>
          </div>
        </div>
      )}

      <Modal
        open={notificationModal.open}
        title={notificationModal.title}
        message={notificationModal.message}
        confirmText="Aceptar"
        onlyConfirm
        onConfirm={() => setNotificationModal((prev) => ({ ...prev, open: false }))}
        danger={notificationModal.error}
      />
    </div>
  );
};

export default CreateUserPage;
