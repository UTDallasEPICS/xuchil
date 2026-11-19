"use client";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import Button from "@/components/Button";
import Modal from "@/components/Modal";
import styles from "./EditUser.module.css";

// El avatar es válido si es una URL que no contiene "placeholder" y comienza con http(s), data:image/ o /
const validAvatar = (value: unknown): string => {
  if (typeof value !== "string") return "";
  const url = value.trim();
  if (!url || /(?:^|\/)\w*placeholder[^/]*\.(?:svg|png|jpe?g|webp)(?:[?#].*)?$/i.test(url)) {
    return "";
  }
  return /^(https?:\/\/|data:image\/|\/(?!\/))/i.test(url) ? url : "";
};

const isPhoneValid = (phone: string) =>
  !phone.trim() || phone.replace(/\D/g, "").length >= 10;

const EditProfile = () => {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [name, setName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [avatar, setAvatar] = useState("");
  const [avatarPreview, setAvatarPreview] = useState("");
  const [feedback, setFeedback] = useState<{ type: "error" | "success"; message: string } | null>(
    null
  );
  const [showSuccessModal, setShowSuccessModal] = useState(false);

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

        const fullName = authUser.worker?.fullName ?? "";
        const nameParts = fullName.split(" ");
        const safeAvatar = validAvatar(authUser.worker?.profilePhotoUrl);

        setName(nameParts[0] || "");
        setLastName(nameParts.slice(1).join(" ") || "");
        setEmail(authUser.email ?? "");
        setPhone(authUser.worker?.phone ?? "");
        setAvatar(safeAvatar);
        setAvatarPreview(safeAvatar);
      } catch {
        router.push("/login");
      }
    }

    loadProfile();

    return () => {
      mounted = false;
    };
  }, [router]);

  const handleImageUploadClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.match("image.*")) {
        setFeedback({
          type: "error",
          message: "Selecciona una imagen válida (JPEG, PNG, etc.).",
        });
        e.target.value = "";
        return;
      }

      if (file.size > 2 * 1024 * 1024) {
        setFeedback({
          type: "error",
          message: "La imagen es demasiado grande (máximo 2 MB).",
        });
        e.target.value = "";
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        setAvatarPreview(result);
        setAvatar(result);
        setFeedback({
          type: "success",
          message: "Imagen cargada correctamente. Pulsa Guardar para aplicar los cambios.",
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async () => {
    setFeedback(null);

    if (!name.trim()) {
      setFeedback({
        type: "error",
        message: "El nombre es obligatorio.",
      });
      return;
    }

    if (!isPhoneValid(phone)) {
      setFeedback({
        type: "error",
        message: "El teléfono debe tener al menos 10 dígitos.",
      });
      return;
    }

    try {
      const safeAvatar = validAvatar(avatar || avatarPreview);
      const response = await fetch("/api/users/me", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          fullName: `${name.trim()} ${lastName.trim()}`.trim(),
          phone: phone.trim() || null,
          profilePhotoUrl: safeAvatar || null,
        }),
      });

      if (!response.ok) {
        setFeedback({
          type: "error",
          message: "No se pudieron guardar los cambios. Intenta nuevamente.",
        });
        return;
      }

      setFeedback({
        type: "success",
        message: "Tus cambios se guardaron correctamente.",
      });
      setShowSuccessModal(true);
    } catch {
      setFeedback({
        type: "error",
        message: "Error de conexión al guardar el perfil.",
      });
    }
  };

  const handleConfirm = () => {
    setShowSuccessModal(false);
    router.push("/user");
  };

  const iniciales =
    `${name} ${lastName}`
      .trim()
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((p) => p.charAt(0).toUpperCase())
      .join("") || "?";

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

        <h1 className={styles.title}>Editar perfil</h1>
      </header>

      <section className={styles.card}>
        <div className={styles.identity}>
          {avatarPreview ? (
            <img
              className={styles.avatar}
              src={avatarPreview}
              alt="Foto de perfil"
            />
          ) : (
            <span className={styles.avatarFallback} aria-hidden="true">
              {iniciales}
            </span>
          )}

          <div className={styles.identityText}>
            <p className={styles.identityName}>
              {`${name} ${lastName}`.trim() || "Sin nombre"}
            </p>

            <input
              type="file"
              id="avatar-upload"
              ref={fileInputRef}
              accept="image/*"
              onChange={handleImageChange}
              className={styles.hidden}
            />

            <div className={styles.photoBtn}>
              <Button
                size="small"
                action="outline"
                onClick={handleImageUploadClick}
              >
                Cambiar foto
              </Button>
            </div>
          </div>
        </div>
      </section>

      <section className={styles.card}>
        <div className={styles.field}>
          <label className={styles.label} htmlFor="nombre">
            Nombre
          </label>
          <input
            id="nombre"
            type="text"
            className={styles.input}
            placeholder="Nombre"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>

        <div className={styles.field}>
          <label className={styles.label} htmlFor="apellido">
            Apellido
          </label>
          <input
            id="apellido"
            type="text"
            className={styles.input}
            placeholder="Apellido"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
          />
        </div>

        <div className={styles.field}>
          <label className={styles.label} htmlFor="correo">
            Correo electrónico
          </label>
          <input
            id="correo"
            type="email"
            className={styles.input}
            placeholder="correo@ejemplo.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>

        <div className={styles.field}>
          <label className={styles.label} htmlFor="telefono">
            Teléfono
          </label>
          <input
            id="telefono"
            type="tel"
            inputMode="tel"
            className={styles.input}
            placeholder="+52 951 000 00 00"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
          />
        </div>
      </section>

      {feedback && (
        <p
          role={feedback.type === "error" ? "alert" : "status"}
          style={{
            color: feedback.type === "error" ? "#b42318" : "#176b42",
            margin: "4px 0",
            textAlign: "center",
            fontWeight: 700,
          }}
        >
          {feedback.message}
        </p>
      )}

      <div className={styles.actions}>
        <Button size="regular" action="outline" onClick={() => router.push("/user")}>
          Cancelar
        </Button>
        <Button size="regular" action="primary" onClick={handleSave}>
          Guardar
        </Button>
      </div>

      <Modal
        open={showSuccessModal}
        title="¡Cambios guardados!"
        message="Tu perfil ha sido actualizado exitosamente."
        confirmText="Aceptar"
        onlyConfirm
        onConfirm={handleConfirm}
      />
    </div>
  );
};

export default EditProfile;
