// Shown for any URL that doesn't exist, and for admin-only pages (e.g. /analytics)
// when a non-admin opens them; src/proxy.ts rewrites those requests here.
import Link from "next/link";
import styles from "./NotFound.module.css";

const NotFound = () => {
  return (
    <main className={styles.wrapper}>
      <p className={styles.code}>404</p>
      <h1 className={styles.title}>Página no encontrada</h1>
      <p className={styles.text}>
        La página que buscas no existe o no tienes permiso para verla.
      </p>
      <Link href="/process-control" className={styles.button}>
        Volver al inicio
      </Link>
    </main>
  );
};

export default NotFound;
