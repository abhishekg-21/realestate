import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import SuperAdminSidebar from "@/components/super-admin-sidebar";

export const metadata = {
  title: "Super Admin Panel — PropertiesNexus",
  description: "Platform administration and management console",
};

export default async function SuperAdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?next=/super-admin");
  }

  // Check role from profiles table
  const { data: profile } = await supabase
    .from("profiles")
    .select("role, full_name")
    .eq("id", user.id)
    .single();

  if (!profile || !["super_admin", "admin"].includes(profile.role)) {
    redirect("/dashboard?error=unauthorized");
  }

  return (
    <div className="grid grid-cols-[270px_1fr] max-md:grid-cols-1 min-h-screen bg-[#0a0f1c]">
      <SuperAdminSidebar
        userEmail={user.email || ""}
        userName={profile.full_name || user.email?.split("@")[0] || "Admin"}
      />
      <main className="min-w-0 overflow-x-hidden flex flex-col bg-[#f0f2f5]">
        {children}
      </main>
    </div>
  );
}
