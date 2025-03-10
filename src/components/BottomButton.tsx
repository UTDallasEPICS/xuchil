import React from "react";
import Button from "./Button"
import styles from "../styles/BottomButton.module.css";

interface BottomButtonProps {
  children: React.ReactNode;
  onClick: () => void;
  size?: "regular" | "small" | "mini";
  action?: "primary" | "secondary" | "negative";
}

const BottomButton: React.FC<BottomButtonProps> = ({ children, onClick, size, action }) => {
  return (
    <div className={styles.bottomButtonContainer}>
      <Button onClick={onClick} size={size} action={action}>
        {children}
      </Button>
    </div>
  );
};

export default BottomButton;
