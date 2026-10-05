import type { Metadata, Viewport } from "next";
import "./globals.css";
import { AppProvider } from "@/lib/store/AppContext";
import { BottomNav } from "@/components/layout/BottomNav";
import { Header } from "@/components/layout/Header";

export const metadata: Metadata = {
  title: "PeakForm — AI Gym Tracker",
  description:
    "AI-powered workout tracking with real-time pose detection, rep counting, and personalized plans.",
  manifest: "/manifest.json",
  themeColor: "#070B14",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  themeColor: "#070B14",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body>
        <AppProvider>
          <div className="mx-auto min-h-screen w-full max-w-md md:max-w-3xl lg:max-w-5xl pb-24 md:pb-10">
            <Header />
            <main className="px-4 md:px-6">{children}</main>
            <BottomNav />
          </div>
        </AppProvider>
      </body>
    </html>
  );
}
