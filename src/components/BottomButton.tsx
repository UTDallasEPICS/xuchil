import React from "react";
import Button from "./Button"
import styles from "../styles/BottomButton.module.css";

interface BottomButtonProps {
  children: React.ReactNode;
  onClick: () => void;
  disabled?: boolean;
}

const BottomButton: React.FC<BottomButtonProps> = ({ children, onClick, disabled }) => {
  return (
    <div className={styles.bottomButtonContainer}>
      <Button onClick={onClick} size={"regular"} action={"inverted"} disabled={disabled}>
        {children}
      </Button>
    </div>
  );
};

export default BottomButton;
