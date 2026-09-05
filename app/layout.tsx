import type { Metadata } from "next";
import { Open_Sans } from "next/font/google";
import { Toaster } from "sonner";
import { SessionProvider } from "@/components/providers/session-provider";
import "./globals.css";

const openSans = Open_Sans({
  subsets: ["latin"],
  variable: "--font-open-sans",
  display: "swap",
});

export const metadata: Metadata = {
  title: "LedgerOne - Enterprise Accounting & Furniture ERP",
  description: "Next-generation accounting and business-management platform for furniture enterprises.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={openSans.variable}>
      <body className="font-sans antialiased bg-background text-foreground selection:bg-teal/20 selection:text-teal">
        <SessionProvider>
          {children}
        </SessionProvider>
        <Toaster position="top-right" richColors closeButton />
      </body>
    </html>
  );
}
