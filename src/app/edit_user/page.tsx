"use client";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import HeaderXuchil from "@/components/HeaderXuchil";
import Button from "@/components/Button";
import Modal from "@/components/Modal";
import userService from "@/lib/services/userService";

const EditProfile = () => {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [name, setName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [avatar, setAvatar] = useState("");
  const [avatarPreview, setAvatarPreview] = useState("");
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  useEffect(() => {
    let mounted = true;

    async function loadProfile() {
      try {
        const authUser = await userService.getCurrentUser();
        if (!authUser) {
          router.push("/login");
          return;
        }

        if (!mounted) return;

        const fullName = authUser.worker?.fullName ?? "";
        const nameParts = fullName.split(" ");

        const mapped = {
          name: fullName,
          email: authUser.email ?? "",
          phone: authUser.worker?.phone ?? "",
          avatar: authUser.worker?.profilePhotoUrl ?? "",
          position: authUser.worker?.role?.name ?? "",
          hours: "",
        };

        setName(nameParts[0] || "");
        setLastName(nameParts.slice(1).join(" ") || "");
        setEmail(mapped.email);
        setPhone(mapped.phone);
        setAvatarPreview(mapped.avatar || "/user-placeholder.svg");
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
      if (!file.type.match('image.*')) {
        alert('Por favor selecciona una imagen (JPEG, PNG, etc.)');
        return;
      }

      if (file.size > 2 * 1024 * 1024) {
        alert('La imagen es demasiado grande (máximo 2MB)');
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        setAvatarPreview(result);
        setAvatar(result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async () => {
    try {
      await userService.updateCurrentUser({
        fullName: `${name} ${lastName}`.trim(),
        phone,
        profilePhotoUrl: avatar || avatarPreview,
      });

      setShowSuccessModal(true);
    } catch {
      return;
    }
  };

  const handleConfirm = () => {
    setShowSuccessModal(false);
    router.push("/user");
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        backgroundColor: "var(--color-background)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        paddingTop: "1rem",
      }}
    >
      <HeaderXuchil />

      <div
        style={{
          width: "90%",
          maxWidth: "360px",
          backgroundColor: "var(--color-background)",
          padding: "24px",
          borderRadius: "20px",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          boxSizing: "border-box",
        }}
      >
        <img
          src={avatarPreview}
          alt="Foto de perfil"
          style={{
            width: "140px",
            height: "140px",
            borderRadius: "50%",
            backgroundColor: "#ccc",
            marginBottom: "12px",
            textAlign: "center",
            objectFit: "cover",
          }}
        />

        <input
          type="file"
          id="avatar-upload"
          ref={fileInputRef}
          accept="image/*"
          onChange={handleImageChange}
          style={{ display: "none" }}
        />
        
        <Button
          size="small"
          action="secondary"
          onClick={handleImageUploadClick}
          style={{ marginBottom: "20px" }}
        >
          Subir Foto
        </Button>

        <div
          style={{
            width: "100%",
            marginTop: "20px",
            paddingLeft: "8px",
            paddingRight: "8px",
            boxSizing: "border-box",
          }}
        >
          <label>Nombre:</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            style={{
              width: "100%",
              padding: "10px",
              borderRadius: "10px",
              border: "1px solid #333",
              marginBottom: "12px",
              boxSizing: "border-box",
            }}
          />

          <label>Apellido:</label>
          <input
            type="text"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            style={{
              width: "100%",
              padding: "10px",
              borderRadius: "10px",
              border: "1px solid #333",
              marginBottom: "12px",
              boxSizing: "border-box",
            }}
          />

          <label>Correo Electrónico:</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={{
              width: "100%",
              padding: "10px",
              borderRadius: "10px",
              border: "1px solid #333",
              marginBottom: "12px",
              boxSizing: "border-box",
            }}
          />

          <label>Teléfono:</label>
          <input
            type="text"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            style={{
              width: "100%",
              padding: "10px",
              borderRadius: "10px",
              border: "1px solid #333",
              marginBottom: "20px",
              boxSizing: "border-box",
            }}
          />
        </div>

        <Button
          size="regular"
          action="primary"
          onClick={handleSave}
          style={{ marginTop: "10px", marginBottom: "50px", width: "100%" }}
        >
          Listo
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