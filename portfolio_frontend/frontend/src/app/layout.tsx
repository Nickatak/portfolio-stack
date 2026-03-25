import type { Metadata } from "next";
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

export const metadata: Metadata = {
  title: 'Nick Takemori | Full Stack Developer',
  description: 'Full-stack developer focused on domain modeling, event-driven systems, and clean architecture.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const isDemoMode = process.env.DEMO_MODE === "true";

  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {isDemoMode && (
          <div className="w-full bg-amber-100 text-amber-900 border-b border-amber-200 px-4 py-2 text-sm text-center">
            Demo mode: booking requests are not sent or saved.
          </div>
        )}
        {children}
      </body>
    </html>
  );
}
