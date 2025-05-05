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
      }}
    >
      <div
        style={{
          backgroundColor: "#fff",
          borderRadius: "10px",
          padding: "24px",
          width: "90%",
          maxWidth: "360px",
          textAlign: "center",
          boxShadow: "0 2px 12px rgba(0,0,0,0.25)",
        }}
      >
        {title && (
          <h3
            style={{
              marginBottom: "12px",
              color: danger ? "var(--color-negative)" : "var(--color-green-dark)",
            }}
          >
            {title}
          </h3>
        )}
        <p style={{ marginBottom: "24px" }}>{message}</p>

        <div
          style={{
            display: "flex",
            justifyContent: onlyConfirm ? "center" : "space-between",
            gap: "10px",
          }}
        >
          {!onlyConfirm && (
            <Button size="small" action="secondary" onClick={onCancel}>
              {cancelText}
            </Button>
          )}
          <Button size="small" action={danger ? "negative" : "primary"} onClick={onConfirm}>
            {confirmText}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Modal;
