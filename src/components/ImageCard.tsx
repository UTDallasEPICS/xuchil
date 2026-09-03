"use client";

import React from "react";
import { useRouter } from "next/navigation";
import styles from "../styles/ImageCard.module.css";

interface ImageCardProps {
  imageSrc: string;
  text: string;
  type?: "small" | "square" | "large";
  route?: string;
  onClick?: () => (void | Promise<void>);
}

const ImageCard: React.FC<ImageCardProps> = ({
  imageSrc,
  text,
  type = "small",
  route,
  onClick,
}) => {
  const router = useRouter();

  const handleClick = () => {
    if (onClick) {
      onClick();
    }
    if (route) {
      router.push(route);
    }
  };

  return (
    <div
      className={`${styles.card} ${styles[type]}`}
      onClick={handleClick}
    >
      <img src={imageSrc} alt={text} className={styles.image} />
      <p className={styles.text}>{text}</p>
    </div>
  );
};

export default ImageCard;
