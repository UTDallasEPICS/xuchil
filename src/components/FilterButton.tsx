"use client";
import React, { useState } from "react";
import Image from "next/image";
import styles from "@/styles/FilterButton.module.css";
import { LucideIcon, ChevronDown } from "lucide-react";
import type { FilterOption } from "@/types/FilterOption";

interface FilterButtonProps {
  title: string;
  options: FilterOption[];
  onChange?: (selected: FilterOption) => void;
  variant?: "light" | "dark";
}

const iconSize = (s: number) => ({ width: s, height: s });

const renderGraphic = (opt: FilterOption, size = 20) => {
  if (opt.icon)        return <opt.icon size={size} />;
  if (opt.img)         return (
    <Image
      src={opt.img}
      alt={opt.label}
      {...iconSize(size)}
    />
  );
  return null;
};

const FilterButton: React.FC<FilterButtonProps> = ({
  title,
  options,
  onChange,
  variant = "light",
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedOption, setSelectedOption] = useState<FilterOption>(options[0]);

  const handleSelect = (option: FilterOption) => {
    setSelectedOption(option);
    setIsOpen(false);
    onChange?.(option);
  };

  return (
    <div>
      <button
        className={`
          ${styles.filterButton}
          ${variant === "dark" ? styles.dark : styles.light}
        `}
        onClick={() => setIsOpen(true)}
      >
        {renderGraphic(selectedOption)}
        <span>{selectedOption.label}</span>
        <ChevronDown size={20} />
      </button>

      {isOpen && (
        <div className={styles.overlay} onClick={() => setIsOpen(false)}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <h2>{title}</h2>
            <ul>
              {options.map((option, index) => (
                <li key={index} onClick={() => handleSelect(option)}>
                  {renderGraphic(option, 24)}
                  {option.label}
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
};

export default FilterButton;
