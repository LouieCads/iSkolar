import type { Metadata } from "next";
import { getPlatformDetails } from "@/lib/getPlatformDetails";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// This function runs on the server at build time or request time
export async function generateMetadata(): Promise<Metadata> {
  const { name: platformName } = await getPlatformDetails();
  return {
    title: platformName,
    description: `A blockchain-powered scholarship startup that connects Filipino university students and sponsors through transparent fund disbursement, credential-based applications, and wallet-to-wallet tuition payments.`,
  };
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
