import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "非洲情报看板 | Africa Intelligence",
  description: "聚焦中非合作、非洲政治经济动态 - 每日简报与日报",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <body className="antialiased bg-[#0a0a0f] text-gray-200 min-h-screen">
        {children}
      </body>
    </html>
  );
}
