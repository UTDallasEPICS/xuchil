"use client";

import React from "react";
import styles from "@/styles/DeleteModal.module.css";
import Button from "@/components/Button";

interface DeleteModalProps {
  message: string;
  onCancel: () => void;
  onConfirm: () => void;
}

const DeleteModal: React.FC<DeleteModalProps> = ({
  message,
  onCancel,
  onConfirm,
}) => (
  <div className={styles.overlay} onClick={onCancel}>
    <div
      className={styles.modal}
      onClick={(e) => e.stopPropagation()}
    >
      <p>{message}</p>

      <div className={styles.actions}>
        <Button action="secondary" onClick={onCancel}>
          Cancelar
        </Button>
        <Button action="negative" onClick={onConfirm}>
          Eliminar
        </Button>
      </div>
    </div>
  </div>
);

export default DeleteModal;
