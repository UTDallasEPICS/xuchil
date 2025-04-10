"use client";

import React from "react";
import { useRouter } from "next/navigation";
import styles from "../styles/ImageCard.module.css";

interface ImageCardProps {
  imageSrc: string;
  text: string;
  type?: "small" | "square" | "large";
  route: string;
}

const ImageCard: React.FC<ImageCardProps> = ({
  imageSrc,
  text,
  type = "small",
  route,
}) => {
  const router = useRouter();

  const handleClick = () => {
    router.push(route);
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
