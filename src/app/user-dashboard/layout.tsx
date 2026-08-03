import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import DashboardSidebar from "@/components/dashboard-sidebar";

export default async function UserDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?message=Please sign in to access your account.");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role, full_name")
    .eq("id", user.id)
    .single();

  const role = profile?.role || user.user_metadata?.role || "buyer";
  const fullName = profile?.full_name || user.user_metadata?.full_name || user.email?.split("@")[0] || "User";
  const userEmail = user.email || "";

  if (role === "super_admin") {
    redirect("/super-admin");
  } else if (["agent", "builder", "lister"].includes(role)) {
    redirect("/dashboard");
  }

  return (
    <div className="grid grid-cols-[255px_1fr] max-md:grid-cols-1 min-h-screen bg-paper font-sans">
      <DashboardSidebar userEmail={userEmail} role={role} fullName={fullName} />
      <div className="min-w-0 overflow-x-hidden flex flex-col">
        {children}
      </div>
    </div>
  );
}
