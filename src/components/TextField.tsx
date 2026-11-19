"use client";

import React, { useEffect, useRef } from "react";
import styles from "@/styles/TextField.module.css";

interface TextFieldProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  placeholder?: string;
  value?: string;
  onChange?: (event: React.ChangeEvent<HTMLTextAreaElement>) => void;
  id?: string;
  rows?: number;
  block?: boolean;
  autoGrow?: boolean;
}

const TextField: React.FC<TextFieldProps> = ({
  placeholder,
  value,
  onChange,
  id,
  rows,
  block = false,
  autoGrow = false,
  ...props
}) => {
  const ref = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (!autoGrow) return;
    const el = ref.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${el.scrollHeight}px`;
  }, [value, autoGrow]);

  return (
    <textarea
      {...props}
      ref={ref}
      id={id}
      rows={rows ?? (autoGrow ? 2 : undefined)}
      className={`${styles.textField} ${block ? styles.block : ""} ${
        autoGrow ? styles.autoGrow : ""
      }`}
      placeholder={placeholder}
      value={value}
      onChange={onChange}
    />
  );
};

export default TextField;
