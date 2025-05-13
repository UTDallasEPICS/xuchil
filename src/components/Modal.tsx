import React from "react";
import Button from "./Button";

interface ModalProps {
  open: boolean;
  title?: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm?: () => void;
  onCancel?: () => void;
  danger?: boolean;
  onlyConfirm?: boolean;
  width?: string; // Nueva prop opcional para controlar el ancho
}

const Modal: React.FC<ModalProps> = ({
  open,
  title,
  message,
  confirmText = "Aceptar",
  cancelText = "Cancelar",
  onConfirm,
  onCancel,
  danger = false,
  onlyConfirm = false,
  width = "90%", // Valor por defecto
}) => {
  if (!open) return null;

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        backgroundColor: "rgba(0,0,0,0.5)",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        zIndex: 1000,
        padding: "16px", // Añadido padding para dispositivos móviles
      }}
    >
      <div
        style={{
          backgroundColor: "#fff",
          borderRadius: "10px",
          padding: "24px",
          width: width, // Usamos la prop width
          maxWidth: "400px", // Ajustado el máximo ancho
          minWidth: "280px", // Mínimo ancho para evitar modales muy estrechos
          textAlign: "center",
          boxShadow: "0 2px 12px rgba(0,0,0,0.25)",
          margin: "auto", // Centrado adicional
        }}
      >
        {title && (
          <h3
            style={{
              marginBottom: "12px",
              color: danger ? "var(--color-negative)" : "var(--color-green-dark)",
              fontSize: "1.25rem", // Tamaño de fuente más consistente
            }}
          >
            {title}
          </h3>
        )}
        <p style={{ 
          marginBottom: "24px",
          lineHeight: "1.5", // Mejor legibilidad
          wordBreak: "break-word", // Evita desbordamiento de texto
        }}>
          {message}
        </p>

        <div
          style={{
            display: "flex",
            justifyContent: onlyConfirm ? "center" : "space-between",
            gap: "12px", // Espaciado ligeramente mayor
            flexWrap: "wrap", // Para pantallas muy pequeñas
          }}
        >
          {!onlyConfirm && (
            <Button size="small" action="secondary" onClick={onCancel}>
              {cancelText}
            </Button>
          )}
          <Button 
            size="small" 
            action={danger ? "negative" : "primary"} 
            onClick={onConfirm}
            style={{ flex: onlyConfirm ? "none" : "1" }} // Mejor distribución del espacio
          >
            {confirmText}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Modal;