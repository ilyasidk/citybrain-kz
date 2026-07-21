import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { StoreProvider } from "@/lib/store";
import Header from "@/components/Header";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

export const metadata: Metadata = {
  title: "CityBrain KZ — карта городских проблем",
  description:
    "AI-платформа, которая собирает обращения жителей о городских проблемах, классифицирует их и превращает в карту инцидентов с аналитикой для акимата.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ru" className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col">
        <StoreProvider>
          <Header />
          <main className="flex-1 flex flex-col">{children}</main>
        </StoreProvider>
      </body>
    </html>
  );
}
