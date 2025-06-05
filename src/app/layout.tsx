import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "PawLog - 반려견 일상 기록 서비스",
  description: "반려견과의 소중한 순간들을 기록하고 관리하는 펫 다이어리 서비스",
  keywords: "반려견, 펫다이어리, 루틴관리, 건강관리, 일기, 강아지",
  openGraph: {
    title: "PawLog - 반려견 일상 기록 서비스",
    description: "반려견과의 소중한 순간들을 기록하고 관리하는 펫 다이어리 서비스",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
