import type { Metadata } from "next";
import { Inter, Plus_Jakarta_Sans } from "next/font/google";
import { cn } from "@/lib/utils";
import { Toaster } from "@/components/ui/sonner";
import { MotionProvider } from "@/components/providers/MotionProvider";
import { ThemeProvider } from "@/components/providers/ThemeProvider";
import { Footer } from "@/components/marketing/Footer";

import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "700", "800"],
  variable: "--font-heading",
  display: "swap",
});

export const metadata: Metadata = {
  title: "causeClub - Existing for a cause",
  description:
    "Win up to £10,000 every month. £9.99/month, 10% goes to the charity you choose.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={plusJakarta.variable} suppressHydrationWarning>
      <body
        className={cn(
          inter.variable,
          plusJakarta.variable,
          "font-sans antialiased"
        )}
      >
        <ThemeProvider>
          <MotionProvider>
            {children}
            <Footer />
            <Toaster />
          </MotionProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}