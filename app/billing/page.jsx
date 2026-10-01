import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import LogoutButton from "./LogoutButton";
import BillingForm from "./BillingForm";

export default async function BillingPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/admin-login");
  }

  return (
    <main className="min-h-screen bg-offwhite px-6 py-16 md:px-14">
      <div className="mx-auto max-w-3xl">
        <div className="flex items-center justify-between">
          <h1 className="font-serif text-3xl text-ink">Billing</h1>
          <LogoutButton />
        </div>
        <p className="mt-2 text-sm text-ink/50">Signed in as {user.email}</p>

        <BillingForm />
      </div>
    </main>
  );
}
