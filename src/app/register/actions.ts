"use server";

import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";

export async function register(formData: FormData) {
  
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const role = formData.get("role") as string;
  
  const supabase = await createClient();

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        role: role || "buyer"
      }
    }
  });

  if (error) {
    return redirect(`/register?message=${encodeURIComponent(error.message)}`);
  }

  // Assuming email confirmation is disabled for now, or redirecting to a check email page
  return redirect("/login?message=Registration successful. Please sign in.");
}
