"use client";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import HeaderXuchil from "@/components/HeaderXuchil";
import Button from "@/components/Button";

const PLACEHOLDER_AVATAR = "/user-placeholder.svg";

// el avatar es válido si es una URL que no contiene "placeholder" y termina con una extensión de imagen válida
const validAvatar = (value: unknown): string => {
  if (typeof value !== "string") return "";
  const url = value.trim();
  if (!url || /(?:^|\/)\w*placeholder[^/]*\.(?:svg|png|jpe?g|webp)(?:[?#].*)?$/i.test(url)) return "";
  return /^(https?:\/\/|data:image\/|\/(?!\/))/i.test(url) ? url : "";
};

const EditProfile = () => {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [userData, setUserData] = useState<any>(null);
  const [name, setName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [avatar, setAvatar] = useState("");
  const [avatarPreview, setAvatarPreview] = useState("");
  const [feedback, setFeedback] = useState<{ type: "error" | "success"; message: string } | null>(null);

  useEffect(() => {
    const storedUserData = localStorage.getItem("userData");
    const username = localStorage.getItem("currentUser");
    
    if (storedUserData && username) {
      const parsedData = JSON.parse(storedUserData);
      setUserData(parsedData);
      
      const nameParts = parsedData.name.split(" ");
      setName(nameParts[0] || "");
      setLastName(nameParts.slice(1).join(" ") || "");
      
      setEmail(parsedData.email || "");
      setPhone(parsedData.phone || "");
      setAvatarPreview(parsedData.avatar || "/user-placeholder.svg");
    } else {
      router.push("/login");
    }
  }, []);

  const handleImageUploadClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.match('image.*')) {
        setFeedback({ type: "error", message: "Selecciona una imagen válida (JPEG, PNG, etc.)." });
        e.target.value = "";
        return;
      }

      if (file.size > 2 * 1024 * 1024) {
        setFeedback({ type: "error", message: "La imagen es demasiado grande (máximo 2 MB)." });
        e.target.value = "";
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        setAvatarPreview(result);
        setAvatar(result);
        setFeedback({ type: "success", message: "Tus cambios se guardaron correctamente." });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = () => {
    const username = localStorage.getItem("currentUser");
    if (!username) {
      router.push("/login");
      return;
    }

    if (!name.trim() || !lastName.trim() || !email.trim()) {
      setFeedback({ type: "error", message: "Completa nombre, apellido y correo antes de guardar." });
      return;
    }

    const savedAvatar = validAvatar(avatar) || validAvatar(avatarPreview) || null;
    const updatedUserData = {
      ...userData,
      name: `${name} ${lastName}`.trim(),
      email,
      phone,
      avatar: avatar || avatarPreview,
    };

    localStorage.setItem("userData", JSON.stringify(updatedUserData));
    
    localStorage.setItem(`userProfile_${username}`, JSON.stringify({
      name: `${name} ${lastName}`.trim(),
      email,
      phone,
      avatar: avatar || avatarPreview,
      position: userData.position,
      hours: userData.hours
    }));
    
    setFeedback({ type: "success", message: "Tus cambios se guardaron correctamente." });
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
        
        {feedback && (
          <p role={feedback.type === "error" ? "alert" : "status"}
            style={{ width: "100%", fontSize: "0.9rem", color: feedback.type === "error" ? "#b42318" : "#176b42", margin: "8px 0", textAlign: "center" }}>
            {feedback.message}
          </p>
        )}
        <Button
          size="regular"
          action="primary"
          onClick={handleSave}
          style={{ marginTop: "10px", marginBottom: "50px", width: "100%" }}
        >
          Listo
        </Button>
      </div>

    </div>
  );
};

export default EditProfile;