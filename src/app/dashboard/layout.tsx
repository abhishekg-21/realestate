import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import DashboardSidebar from "@/components/dashboard-sidebar";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?message=Please sign in to access your dashboard.");
  }

  // Fetch real role from profiles table
  const { data: profile } = await supabase
    .from("profiles")
    .select("role, full_name, phone")
    .eq("id", user.id)
    .single();

  const role = profile?.role || user.user_metadata?.role || "user";
  const fullName =
    profile?.full_name ||
    user.user_metadata?.full_name ||
    user.email?.split("@")[0] ||
    "User";
  const userEmail = user.email || "";

  return (
    <div className="grid grid-cols-[255px_1fr] max-md:grid-cols-1 min-h-screen bg-paper font-sans">
      <DashboardSidebar userEmail={userEmail} role={role} fullName={fullName} />
      <div className="min-w-0 overflow-x-hidden flex flex-col">{children}</div>
    </div>
  );
}
