"use client";
import { usePathname } from "next/navigation";
import BottomTabBar from "@/components/BottomTabBar";

export default function ClientLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const pathname = usePathname();
  const isLoginPage = pathname === '/login';

  return (
    <>
      <div className={`main-content ${isLoginPage ? 'login-page' : ''}`}>
        {children}
      </div>
      {!isLoginPage && <BottomTabBar className="bottom-tab-bar" />}
    </>
  );
}