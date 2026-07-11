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

async function loadShellData() {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    const query = supabase.from("projects").select("id, name, status");
    const { data } = user
      ? await query.eq("user_id", user.id).order("created_at", { ascending: false })
      : await query.is("user_id", null).order("created_at", { ascending: false });

    return { projects: data ?? [], userEmail: user?.email ?? null };
  } catch {
    return { projects: [], userEmail: null };
  }
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { projects, userEmail } = await loadShellData();

  return (
    <html lang="en" className={inter.variable}>
      <body className="antialiased text-neutral-900">
        <AppShell projects={projects} userEmail={userEmail}>
          {children}
        </AppShell>
      </body>
    </html>
  );
}
