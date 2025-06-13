import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import { SessionProvider } from "@/components/SessionProvider";
import { CartProvider } from "@/contexts/CartContext";
import CartSlideOver from "@/components/CartSlideOver";
import BottomNavigation from "@/components/BottomNavigation";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "KadoShop - Modern Alışverişin Adresi",
  description: "En yeni ürünler, en iyi fiyatlar ve hızlı teslimat ile alışverişin keyfini çıkarın",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="tr">
      <body className={inter.className}>
        <SessionProvider>
          <CartProvider>
            <Navbar />
            {children}
            <BottomNavigation />
            <CartSlideOver />
          </CartProvider>
        </SessionProvider>
      </body>
    </html>
  );
}
