import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Sidebar } from "@/components/layout/Sidebar";
import { MobileNav } from "@/components/layout/MobileNav";
import { FeedbackButton } from "@/components/layout/FeedbackButton";
import { Toaster } from "sonner";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "PlotKeeper",
  description: "Personal garden management for Kildare, Ireland",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en-IE">
      <body className={inter.className}>
        <div className="flex min-h-screen bg-background">
          {/* Desktop sidebar */}
          <Sidebar />

          {/* Main content */}
          <main className="flex-1 flex flex-col min-w-0">
            <div className="flex-1 px-4 py-6 md:px-8 pb-28 md:pb-6 max-w-5xl w-full mx-auto">
              {children}
            </div>
          </main>
        </div>

        {/* Mobile bottom nav */}
        <MobileNav />

        {/* Feedback button — fixed, above mobile nav */}
        <FeedbackButton />

        {/* Toast notifications */}
        <Toaster position="bottom-center" richColors closeButton />
      </body>
    </html>
  );
}
