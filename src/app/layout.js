
import "./globals.css";
import { Providers } from "./providers";
import Navbar from "@/components/Navbar";



export const metadata = {
  title: "Learning Management System",
  description: "Learning Management System Website",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={` h-full antialiased`}>
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
