import React from "react";
import styles from "../styles/ImageCard.module.css";

interface ImageCardProps {
  imageSrc: string;
  text: string;
  type?: "small" | "square" | "large";
}

const ImageCard: React.FC<ImageCardProps> = ({ imageSrc, text, type = "small" }) => {
  return (
    <div className={`${styles.card} ${styles[type]}`}>
      <img src={imageSrc} alt={text} className={styles.image} />
      <p className={styles.text}>{text}</p>
    </div>
  );
};

export default ImageCard;
