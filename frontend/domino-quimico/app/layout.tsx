import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import GlobalLogo from "./components/GlobalLogo";
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
  title: "Dominó Químico",
  description: "Plataforma interativa para aprendizado de química",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="pt-BR"
      className={`${geistSans.variable} ${geistMono.variable} h-full`}
    >
      <body className="min-h-screen bg-gray-100 font-sans antialiased">
        <GlobalLogo />
        {children}
      </body>
    </html>
  );
}