import type { Metadata } from "next";
import "./globals.css";
import BottomTabBar from "@/components/BottomTabBar";

export const metadata: Metadata = {
  title: "Xuchil",
  description: "Xuchil Integrated Platform"
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <div className="pb-16"> 
          {children}
        </div>
        <BottomTabBar />
      </body>
    </html>
  );
}
