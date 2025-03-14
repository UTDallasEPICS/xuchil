"use client";
import { FC, useState } from "react";
import { ChevronDown } from "lucide-react";
import Image from "next/image";

import styles from "@/styles/DeliveryType.module.css";
import { deliveryVariants, availableVariants } from "@/constants/deliveryConfig";

interface DeliveryTypeProps {
  variant?: keyof typeof deliveryVariants;
  type?: "icon" | "badge" | "picker";
}

const DeliveryType: FC<DeliveryTypeProps> = ({
  variant = "personal",
  type = "badge",
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
      `}
    >
      <Image
        src={iconSrc}
        alt={alt}
        width={40}
        height={40}
        className={styles.iconImg}
      />

      {(type === "badge" || type === "picker") && (
        <p className={styles.deliveryTypeText}>{label}</p>
      )}

      {type === "picker" && (
        <div className={styles.chevron}>
          <ChevronDown />
        </div>
      )}
    </TagName>
  );
};

export default DeliveryType;
