"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export function UserMenu({ userEmail }: { userEmail: string | null }) {
  const router = useRouter();
  const [signingOut, setSigningOut] = useState(false);

  async function handleLogout() {
    setSigningOut(true);
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  }

  if (!userEmail) {
    return (
      <div className="flex items-center gap-3 text-sm">
        <Link href="/login" className="font-medium text-neutral-600 hover:text-neutral-900">
          Log in
        </Link>
        <Link
          href="/signup"
          className="rounded-md bg-indigo-600 px-3 py-1.5 font-medium text-white hover:bg-indigo-700"
        >
          Sign up
        </Link>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-3 text-sm">
      <span className="max-w-[160px] truncate text-neutral-500" title={userEmail}>
        {userEmail}
      </span>
      <button
        onClick={handleLogout}
        disabled={signingOut}
        className="font-medium text-neutral-600 hover:text-neutral-900 disabled:opacity-50"
      >
        {signingOut ? "Logging out…" : "Log out"}
      </button>
    </div>
  );
}
