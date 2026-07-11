import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { createClient } from "@/lib/supabase/server";
import { AppShell } from "@/components/AppShell";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata: Metadata = {
  title: "TSE — Project Prospecting Tracker",
  description: "Track pursuits, communications, requirements, and bid revisions in one chronology.",
};

async function loadSidebarProjects() {
  try {
    const supabase = await createClient();
    const { data } = await supabase
      .from("projects")
      .select("id, name, status")
      .order("created_at", { ascending: false });
    return data ?? [];
  } catch {
    return [];
  }
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const projects = await loadSidebarProjects();

  return (
    <html lang="en" className={inter.variable}>
      <body className="antialiased text-neutral-900">
        <AppShell projects={projects}>{children}</AppShell>
      </body>
    </html>
  );
}
