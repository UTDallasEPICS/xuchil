"use client";
import {useState} from "react";
import {useRouter} from "next/navigation";
import HeaderXuchil from "@/components/HeaderXuchil";
import Button from "@/components/Button";
import Modal from "@/components/Modal";
import userService from "@/lib/services/userClient";
import {uploadFile} from "@/lib/services/uploadClient";

const CreateUser = () => {
  const router = useRouter();

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [photo, setPhoto] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [photoKey, setPhotoKey] = useState(0);

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [modal, setModal] = useState({
    open: false,
    title: "",
    message: "",
    error: false,
  });

  const isPasswordValid = (pwd: string) =>
      /[a-z]/.test(pwd) &&
      /[A-Z]/.test(pwd) &&
      /\d/.test(pwd) &&
      pwd.length >= 8;

  const isEmailValid = (email: string) =>
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const isPhoneValid = (phone: string) =>
      phone.replace(/\D/g, "").length >= 10;

  const handleCreateUser = async () => {
    if (
        !name ||
        !phone ||
        !email ||
        !password ||
        !confirmPassword
    ) {
      return setModal({
        open: true,
        title: "Campos incompletos",
        message: "Por favor completa todos los campos.",
        error: true,
      });
    }

    if (!isPhoneValid(phone)) {
      return setModal({
        open: true,
        title: "Teléfono inválido",
        message: "El número debe tener al menos 10 dígitos.",
        error: true,
      });
    }

    if (!isEmailValid(email)) {
      return setModal({
        open: true,
        title: "Correo inválido",
        message: "Ingresa un correo electrónico válido.",
        error: true,
      });
    }

    if (password !== confirmPassword) {
      return setModal({
        open: true,
        title: "Contraseñas no coinciden",
        message: "La contraseña y su confirmación deben ser iguales.",
        error: true,
      });
    }

    if (!isPasswordValid(password)) {
      return setModal({
        open: true,
        title: "Contraseña inválida",
        message: "Debe tener al menos 8 caracteres, una mayúscula, una minúscula y un número.",
        error: true,
      });
    }

    try {
      const imgUrl = photo ? (await uploadFile(photo)).path : undefined;
      await userService.createUser({
        name: name.trim(),
        phone,
        email,
        password,
        imgUrl,
      })

      setModal({
        open: true,
        title: "Usuario creado",
        message: "El nuevo usuario ha sido registrado exitosamente.",
        error: false,
      });
    } catch (e: any) {
      return setModal({
        open: true,
        title: "Error al crear usuario",
        message: e?.error ?? "Ocurrió un problema de red al registrar el usuario.",
        error: true,
      });
    }
  };

  const handleModalClose = () => {
    setModal({...modal, open: false});
    if (!modal.error) router.push("/user");
  };

  const handlePhotoChange = (e) => {
    const pic = e.target.files?.[0];
    setPhoto(pic ?? null);
    setPreview(pic ? URL.createObjectURL(pic) : null);
  };

  const handlePhotoClear = (e) => {
    e.preventDefault();
    setPhoto(null);
    setPreview(null)
    setPhotoKey(k => k + 1);
  }

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
        <HeaderXuchil/>

        <div
            style={{
              width: "90%",
              maxWidth: "360px",
              backgroundColor: "var(--color-background)",
              padding: "24px",
              borderRadius: "20px",
            }}
        >
          <h2 style={{textAlign: "center", marginBottom: "1rem"}}>
            Crear nuevo usuario
          </h2>

          {[
            {label: "Nombre y Apellidos", value: name, set: setName},
            {label: "Teléfono", value: phone, set: setPhone},
            {label: "Correo", value: email, set: setEmail},
          ].map((field, idx) => (
              <div key={idx} style={{marginBottom: "12px"}}>
                <label>{field.label}:</label>
                <input
                    type="text"
                    value={field.value}
                    onChange={(e) => field.set(e.target.value)}
                    style={{
                      width: "100%",
                      padding: "10px",
                      borderRadius: "10px",
                      border: "1px solid #333",
                      marginTop: "4px",
                      boxSizing: "border-box",
                    }}
                />
              </div>
          ))}

          <div style={{marginBottom: "12px"}}>
            <label>Foto de Perfil</label>
            <input
                key={photoKey}
                type="file"
                accept="image/*"
                onChange={handlePhotoChange}
                style={{
                  width: "100%",
                  padding: "10px",
                  borderRadius: "10px",
                  border: "1px solid #333",
                  marginTop: "4px",
                  boxSizing: "border-box",
                }}
            />
          </div>
          {preview &&
              <img
                  src={preview}
                  width={200}
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
          }
          {photo &&
              <Button
                  size="small"
                  action="secondary"
                  onClick={handlePhotoClear}
                  style={{marginBottom: "20px"}}
              >
                  Borrar Foto
              </Button>
          }

          <div style={{marginBottom: "12px"}}>
            <label>Contraseña:</label>
            <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={{
                  width: "100%",
                  padding: "10px",
                  borderRadius: "10px",
                  border: "1px solid #333",
                  marginTop: "4px",
                  boxSizing: "border-box",
                }}
            />
            <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  marginTop: "4px",
                  background: "none",
                  color: "var(--color-green-dark)",
                  border: "none",
                  cursor: "pointer",
                  fontSize: "0.9rem",
                  textDecoration: "underline",
                }}
            >
              {showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
            </button>
          </div>

          <div style={{marginBottom: "20px"}}>
            <label>Confirmar Contraseña:</label>
            <input
                type={showConfirmPassword ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                style={{
                  width: "100%",
                  padding: "10px",
                  borderRadius: "10px",
                  border: "1px solid #333",
                  marginTop: "4px",
                  boxSizing: "border-box",
                }}
            />
            <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                style={{
                  marginTop: "4px",
                  background: "none",
                  color: "var(--color-green-dark)",
                  border: "none",
                  cursor: "pointer",
                  fontSize: "0.9rem",
                  textDecoration: "underline",
                }}
            >
              {showConfirmPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
            </button>
          </div>

          <Button
              size="regular"
              action="primary"
              onClick={handleCreateUser}
              style={{width: "100%", marginBottom: "50px"}}
          >
            Crear usuario
          </Button>
        </div>

        <Modal
            open={modal.open}
            title={modal.title}
            message={modal.message}
            confirmText="Aceptar"
            onlyConfirm
            onConfirm={handleModalClose}
            danger={modal.error}
        />
      </div>
  );
};

export default CreateUser;
