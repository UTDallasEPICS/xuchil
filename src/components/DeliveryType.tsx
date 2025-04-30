"use client";
import { FC, useState } from "react";
import { ChevronDown } from "lucide-react";
import Image from "next/image";

import styles from "@/styles/DeliveryType.module.css";
import { deliveryVariants, availableVariants } from "@/constants/deliveryConfig";

type Size = "sm" | "md" | "lg";

interface DeliveryTypeProps {
  variant?: keyof typeof deliveryVariants;
  type?: "icon" | "badge" | "picker";
  size?: Size;
}

const iconSizes: Record<Size, number> = { sm: 18, md: 26, lg: 32 };

const DeliveryType: FC<DeliveryTypeProps> = ({
  variant = "personal",
  type = "badge",
  size = "md",
}) => {
  const [currentVariant, setCurrentVariant] = useState(variant);
  const { iconSrc, alt, label, containerClass } =
    deliveryVariants[currentVariant];

  const handlePickerClick = () => {
    if (type !== "picker") return;
    const currentIndex = availableVariants.indexOf(currentVariant);
    const nextIndex = (currentIndex + 1) % availableVariants.length;
    setCurrentVariant(availableVariants[nextIndex]);
  };

  const TagName = type === "picker" ? "button" : "div";

  return (
    <TagName
      onClick={type === "picker" ? handlePickerClick : undefined}
      type={type === "picker" ? "button" : undefined}
      className={`
        ${styles.deliveryTypeContainer}
        ${containerClass}
        ${styles[type]}
        ${styles[size]}
      `}
    >
      <Image
        src={iconSrc}
        alt={alt}
        width={iconSizes[size]}
        height={iconSizes[size]}
        className={styles.iconImg}
      />

      {(type === "badge" || type === "picker") && (
        <p className={styles.deliveryTypeText}>{label}</p>
      )}

      {type === "picker" && (
        <div className={styles.chevron}>
          <ChevronDown size={iconSizes[size]} />
        </div>
      )}
    </TagName>
  );
};

export default DeliveryType;
