"use client";

import Link from "next/link";
import Image from "next/image";
import { User } from "lucide-react";
import { usePathname } from "next/navigation";
import styles from "@/styles/AppBar.module.css";

export default function AppBar() {
  const pathname = usePathname();
  const isUserSection = pathname.startsWith("/user");

  return (
    <header className={styles.bar}>
      <Link
        href="/process-control"
        className={styles.brand}
        aria-label="Xuchil — ir a control de procesos"
      >
        <Image
          src="/Xuchil.svg"
          alt="Xuchil"
          width={166}
          height={82}
          className={styles.logo}
          priority
        />
      </Link>

      <Link
        href="/user"
        aria-label="Tu perfil"
        aria-current={isUserSection ? "page" : undefined}
        className={`${styles.avatar} ${
          isUserSection ? styles.avatarActive : ""
        }`}
      >
        <User size={20} strokeWidth={2.2} />
      </Link>
    </header>
  );
}
