'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import styles from '@/styles/HeaderNavigator.module.css';

export interface Tab {
  label: string;
  href: string;        
}

interface HeaderNavigatorProps {
  tabs: Tab[];
}

export default function HeaderNavigator({ tabs }: HeaderNavigatorProps) {
  const pathname = usePathname();

  return (
    <nav className={styles.nav}>
      {tabs.map(({ label, href }) => {
        const isActive = pathname.startsWith(href);
        return (
          <Link
            key={href}
            href={href}
            className={`${styles.tab} ${isActive ? styles.active : ''}`}
          >
            {label}
          </Link>
        );
      })}
    </nav>
  );
}
