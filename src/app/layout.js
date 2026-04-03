import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";
import Navbar from "@/components/Navbar";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "LMS Monolith Next.js",
  description: "Next.js Learning Management System App Router only",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}>
      <body className="min-h-screen bg-gray-50 flex flex-col text-gray-900">
        <Providers>
          <Navbar />
          <main className="flex-1 w-full relative">
            {children}
          </main>
        </Providers>
      </body>
    </html>
  );
}
