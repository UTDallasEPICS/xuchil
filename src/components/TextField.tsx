import React from "react";
import styles from "@/styles/TextField.module.css";

interface TextFieldProps {
  placeholder?: string;
  value?: string;
  onChange?: (event: React.ChangeEvent<HTMLTextAreaElement>) => void;
}

const TextField: React.FC<TextFieldProps> = ({ placeholder, value, onChange }) => {
  return (
    <textarea
      className={styles.textField}
      placeholder={placeholder}
      value={value}
      onChange={onChange}
    />
  );
};

export default TextField;
