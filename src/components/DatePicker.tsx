"use client";

import React, { forwardRef } from "react";
import ReactDatePicker, { registerLocale } from "react-datepicker";
import { Calendar as CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import styles from "@/styles/DatePicker.module.css";
import "react-datepicker/dist/react-datepicker.css";

registerLocale("es", es); // locale español

export interface DatePickerProps {
  value: Date | null;
  onChange: (date: Date | null) => void;
  minDate?: Date;
  maxDate?: Date;
  disabled?: boolean;
}

/* ---------- Input personalizado ---------- */
const todayPlaceholder = format(new Date(), "dd/MM/yyyy");

interface CustomInputProps {
  value?: string;                // ← string que inyecta react-datepicker
  onClick?: () => void;
  disabled?: boolean;
  placeholder: string;
}

const CustomInput = forwardRef<HTMLButtonElement, CustomInputProps>(
  ({ value, onClick, disabled, placeholder }, ref) => (
    <button
      ref={ref}
      type="button"
      className={styles.container}
      onClick={onClick}
      disabled={disabled}
    >
      <span className={styles.display}>{value || placeholder}</span>
      <span className={styles.button}>
        <CalendarIcon size={18} strokeWidth={2} />
      </span>
    </button>
  )
);

CustomInput.displayName = "CustomInput";

/* ---------- Componente principal ---------- */
const DatePicker: React.FC<DatePickerProps> = ({
  value,
  onChange,
  minDate,
  maxDate,
  disabled = false,
}) => (
  <ReactDatePicker
    selected={value}
    onChange={onChange}
    minDate={minDate}
    maxDate={maxDate}
    customInput={
      /* ❌  NO pasamos “value”, react-datepicker lo añade
         ✅  Sólo pasamos el placeholder y disabled          */
      <CustomInput placeholder={todayPlaceholder} disabled={disabled} />
    }
    dateFormat="dd/MM/yyyy"
    locale="es"
    disabled={disabled}
    popperClassName={styles.popper}
  />
);

export default DatePicker;
