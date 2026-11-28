import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import "leaflet/dist/leaflet.css"
import Provider from "@/lib/Provider";
import ReduxProvider from "@/redux/ReduxProvider";
import { InitUser } from "@/InitUser";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Wahan-Smart vehicle booking platform",
  description:
    "WahanKaro is a smart vehicle booking platform designed to make travel seamless, affordable, and reliable. Whether it’s daily commutes, long trips, or on‑demand rides, WahanKaro connects users with trusted drivers and vehicles in just a few taps. With real‑time tracking, transparent pricing, and a customer‑first approach, it ensures every journey is safe, convenient, and stress‑free.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <Provider>
          <ReduxProvider>
            <InitUser/>
            {children}
            </ReduxProvider>
        </Provider>
      </body>
    </html>
  );
}
