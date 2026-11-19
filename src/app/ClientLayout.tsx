"use client";
import { usePathname } from "next/navigation";
import AppBar from "@/components/AppBar";
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
      {!isLoginPage && <AppBar />}
      <div className={`main-content${isLoginPage ? '' : ' has-bottom-bar'}`}>
        {children}
      </div>
      {!isLoginPage && <BottomTabBar className="bottom-tab-bar" />}
    </>
  );
}
