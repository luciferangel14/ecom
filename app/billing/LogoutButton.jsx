"use client";

import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function LogoutButton() {
  const router = useRouter();

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  };

  return (
    <button
      onClick={handleLogout}
      className="rounded-full border border-ink/20 px-5 py-2 text-xs font-semibold uppercase tracking-wide text-ink/70 transition-colors hover:border-ink"
    >
      Logout
    </button>
  );
}
