import type { Metadata } from "next";
import { Unbounded, Golos_Text, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { StoreProvider } from "@/lib/store";
import Header from "@/components/Header";

const unbounded = Unbounded({ variable: "--font-unbounded", subsets: ["latin", "cyrillic"] });
const golos = Golos_Text({ variable: "--font-golos", subsets: ["latin", "cyrillic"] });
const jbMono = JetBrains_Mono({ variable: "--font-jbmono", subsets: ["latin", "cyrillic"] });

export const metadata: Metadata = {
  title: "CityBrain KZ — карта городских проблем",
  description:
    "AI-платформа, которая собирает обращения жителей о городских проблемах, классифицирует их и превращает в карту инцидентов с аналитикой для акимата.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="ru"
      className={`${unbounded.variable} ${golos.variable} ${jbMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <StoreProvider>
          <Header />
          <main className="flex-1 flex flex-col">{children}</main>
        </StoreProvider>
      </body>
    </html>
  );
}
