import React from "react";
import styles from "@/styles/Header.module.css";
import Image from "next/image";

const HeaderXuchil: React.FC = () => {
  return (
    <header className={styles.header}>
      <Image
        src="/Xuchil.svg"
        alt="Logo de la empresa" 
        width={166}
        height={82}
        className={styles.logo} 
      />
    </header>
  );
};

export default HeaderXuchil;
