import React, { ButtonHTMLAttributes, FC } from "react";
import styles from "@/styles/Button.module.css";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  size?: "regular" | "small" | "mini";
  action?: "primary" | "secondary" | "negative" | "inverted";
}

const Button: FC<ButtonProps> = ({ children, size = "regular", action = "primary", ...props }) => {
  return (
    <button className={`${styles.button} ${styles[size]} ${styles[action]}`} {...props}>
      {children}
    </button>
  );
};

export default Button;
