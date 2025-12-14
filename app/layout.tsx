import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Guess",
  description: "班级娱乐押分平台",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <body>{children}</body>
    </html>
  );
}
