import type { Metadata } from "next";
import { inter, bebasNeue } from "@/lib/fonts";
import "./globals.css";

export const metadata: Metadata = {
  title: "NexSleek - Stream Everything",
  description: "Cinematic streaming experience",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full scroll-smooth">
      <body
        className={`h-full bg-background text-text antialiased ${inter.variable} ${bebasNeue.variable}`}
      >
        {children}
      </body>
    </html>
  );
}
