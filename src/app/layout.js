import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/Providers";
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
  title: "ElevateLMS - Next Generation Learning",
  description: "A premium learning management system for students and teachers.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen bg-gray-50 flex flex-col font-sans`}
      >
        <Providers>
          <Navbar />
          <main className="flex-1 mt-16">
            {children}
          </main>
        </Providers>
      </body>
    </html>
  );
}
