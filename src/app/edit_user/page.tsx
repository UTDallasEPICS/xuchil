"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import HeaderXuchil from "@/components/HeaderXuchil";
import Button from "@/components/Button";
import Modal from "@/components/Modal";
import userService from "@/lib/services/userClient";
import { uploadFile } from "@/lib/services/uploadClient";

const EditProfile = () => {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  // keep raw file and preview URL
  const [avatar, setAvatar] = useState<File | null>(null);
  const [photoUrl, setPhotoUrl] = useState("");
  const [avatarPreview, setAvatarPreview] = useState("");
  const [avatarKey, setAvatarKey] = useState<number>(0);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  useEffect(() => {
    let mounted = true;

    async function loadProfile() {
      try {
        const user = await userService.getCurrentUser();
        if (!user) {
          router.push("/login");
          return;
        }

        if (!mounted) return;

        setName(user.name);
        setEmail(user.email ?? "");
        setPhone(user.phone ?? "");
        setPhotoUrl(user.imgUrl ?? "");
        setAvatarPreview(user.imgUrl ?? "");
      } catch {
        router.push("/login");
      }
    }

    loadProfile();

    return () => {
      mounted = false;
    };
  }, [router]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        alert('La imagen es demasiado grande (máximo 2MB)');
        return;
      }

      setAvatar(file);
      setAvatarPreview(URL.createObjectURL(file));
    }
  };

  const handleImageClear = () => {
    setAvatar(null);
    setAvatarPreview(photoUrl);
    setAvatarKey(avatarKey => avatarKey + 1);
  }

  const handleSave = async () => {
    try {
      const imgUrl = avatar ? (await uploadFile(avatar)).path : undefined;
      await userService.updateCurrentUser({
        name: name.trim(),
        email,
        phone,
        imgUrl,
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
        {avatarPreview && <img
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
        />}

        <input
          type="file"
          id="avatar-upload"
          accept="image/*"
          key={avatarKey}
          onChange={handleImageChange}
          style={{ display: "none" }}
        />
        
        <Button
          size="small"
          action="secondary"
          onClick={handleImageClear}
          style={{ marginBottom: "20px" }}
        >
          Borrar Foto
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
          <label>Nombre y Apellidos:</label>
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