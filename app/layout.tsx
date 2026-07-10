import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";

export const metadata: Metadata = {
  title: "TSE — Project Prospecting Tracker",
  description: "Track pursuits, communications, requirements, and bid revisions in one chronology.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="antialiased bg-neutral-50 text-neutral-900 min-h-screen">
        <header className="border-b border-neutral-200 bg-white">
          <div className="mx-auto max-w-5xl px-6 py-4">
            <Link href="/" className="text-lg font-semibold tracking-tight">
              TSE Tracker
            </Link>
          </div>
        </header>
        <main className="mx-auto max-w-5xl px-6 py-8">{children}</main>
      </body>
    </html>
  );
}
