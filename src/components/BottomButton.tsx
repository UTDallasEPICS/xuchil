import React, { ButtonHTMLAttributes, FC } from "react";
import styles from "../styles/Button.module.css";

const BottomButton: FC<ButtonHTMLAttributes<HTMLButtonElement>> = ({ children, ...props }) => {
  return (
    <button className={styles.bottomButton} {...props}>
      {children}
    </button>
  );
}