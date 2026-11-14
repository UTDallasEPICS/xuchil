"use client";

import React, {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
import styles from "@/styles/FilterButton.module.css";
import { Check, ChevronDown } from "lucide-react";
import type { FilterOption } from "@/types/FilterOption";

interface FilterButtonProps {
  title: string;
  options: FilterOption[];
  onChange?: (selected: FilterOption) => void;
  variant?: "light" | "dark" | "outline";
}

interface MenuPosition {
  left: number;
  width: number;
  maxHeight: number;
  top?: number;
  bottom?: number;
}

const MARGIN = 8;
const GAP = 6;
const MIN_MENU_WIDTH = 220;
const MIN_MENU_HEIGHT = 160;

const useIsoLayoutEffect =
  typeof window !== "undefined" ? useLayoutEffect : useEffect;

const renderGraphic = (opt: FilterOption, size = 18) => {
  if (opt.icon) return <opt.icon size={size} />;
  if (opt.img)
    return <Image src={opt.img} alt="" width={size} height={size} />;
  return null;
};

const FilterButton: React.FC<FilterButtonProps> = ({
  title,
  options,
  onChange,
  variant = "light",
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [selectedOption, setSelectedOption] = useState<FilterOption>(
    options[0]
  );
  const [position, setPosition] = useState<MenuPosition | null>(null);

  const buttonRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const optionRefs = useRef<Array<HTMLButtonElement | null>>([]);

  useEffect(() => setMounted(true), []);

  const place = useCallback(() => {
    const trigger = buttonRef.current;
    if (!trigger) return;

    const rect = trigger.getBoundingClientRect();
    const width = Math.min(
      Math.max(rect.width, MIN_MENU_WIDTH),
      window.innerWidth - MARGIN * 2
    );

    let left = rect.left;
    if (left + width > window.innerWidth - MARGIN) {
      left = window.innerWidth - width - MARGIN;
    }
    if (left < MARGIN) left = MARGIN;

    const spaceBelow = window.innerHeight - rect.bottom - MARGIN - GAP;
    const spaceAbove = rect.top - MARGIN - GAP;
    const openUp = spaceBelow < 200 && spaceAbove > spaceBelow;

    setPosition(
      openUp
        ? {
            left,
            width,
            bottom: window.innerHeight - rect.top + GAP,
            maxHeight: Math.max(MIN_MENU_HEIGHT, spaceAbove),
          }
        : {
            left,
            width,
            top: rect.bottom + GAP,
            maxHeight: Math.max(MIN_MENU_HEIGHT, spaceBelow),
          }
    );
  }, []);

  useIsoLayoutEffect(() => {
    if (isOpen) place();
  }, [isOpen, place]);

  useEffect(() => {
    if (!isOpen) return;

    const onScrollOrResize = () => place();
    window.addEventListener("resize", onScrollOrResize);
    window.addEventListener("scroll", onScrollOrResize, true);

    const onPointerDown = (e: PointerEvent) => {
      const target = e.target as Node;
      if (
        menuRef.current?.contains(target) ||
        buttonRef.current?.contains(target)
      ) {
        return;
      }
      setIsOpen(false);
    };

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setIsOpen(false);
        buttonRef.current?.focus();
      }
    };

    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);

    return () => {
      window.removeEventListener("resize", onScrollOrResize);
      window.removeEventListener("scroll", onScrollOrResize, true);
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [isOpen, place]);

  useEffect(() => {
    if (!isOpen || !position) return;
    const index = Math.max(
      0,
      options.findIndex((o) => o.label === selectedOption?.label)
    );
    optionRefs.current[index]?.focus();
  }, [isOpen, position, options, selectedOption]);

  useEffect(() => {
    setSelectedOption(options[0]);
  }, [options]);

  const handleSelect = (option: FilterOption) => {
    setSelectedOption(option);
    setIsOpen(false);
    buttonRef.current?.focus();
    onChange?.(option);
  };

  const handleMenuKeyDown = (e: React.KeyboardEvent) => {
    const focusAt = (i: number) => {
      const next = (i + options.length) % options.length;
      optionRefs.current[next]?.focus();
    };
    const current = optionRefs.current.findIndex(
      (el) => el === document.activeElement
    );

    if (e.key === "ArrowDown") {
      e.preventDefault();
      focusAt(current + 1);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      focusAt(current - 1);
    } else if (e.key === "Home") {
      e.preventDefault();
      focusAt(0);
    } else if (e.key === "End") {
      e.preventDefault();
      focusAt(options.length - 1);
    }
  };

  const menu =
    isOpen && position ? (
      <div
        ref={menuRef}
        className={styles.menu}
        role="listbox"
        aria-label={title}
        onKeyDown={handleMenuKeyDown}
        style={{
          left: position.left,
          width: position.width,
          maxHeight: position.maxHeight,
          ...(position.top !== undefined
            ? { top: position.top }
            : { bottom: position.bottom }),
        }}
      >
        <p className={styles.menuTitle}>{title}</p>
        <ul className={styles.menuList}>
          {options.map((option, index) => {
            const isSelected = option.label === selectedOption?.label;
            return (
              <li key={option.value ?? option.label}>
                <button
                  type="button"
                  ref={(el) => {
                    optionRefs.current[index] = el;
                  }}
                  role="option"
                  aria-selected={isSelected}
                  className={`${styles.option} ${
                    isSelected ? styles.optionSelected : ""
                  }`}
                  onClick={() => handleSelect(option)}
                >
                  <span className={styles.optionGraphic}>
                    {renderGraphic(option)}
                  </span>
                  <span className={styles.optionLabel}>{option.label}</span>
                  {isSelected && (
                    <Check size={16} className={styles.optionCheck} />
                  )}
                </button>
              </li>
            );
          })}
        </ul>
      </div>
    ) : null;

  return (
    <div className={styles.root}>
      <button
        ref={buttonRef}
        type="button"
        className={`${styles.filterButton} ${styles[variant]} ${
          isOpen ? styles.filterButtonOpen : ""
        }`}
        onClick={() => setIsOpen((o) => !o)}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
      >
        {renderGraphic(selectedOption)}
        <span className={styles.triggerLabel}>{selectedOption?.label}</span>
        <ChevronDown size={18} className={styles.chevron} />
      </button>

      {mounted && menu ? createPortal(menu, document.body) : null}
    </div>
  );
};

export default FilterButton;
