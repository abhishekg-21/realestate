// // src/app/register/actions.ts
// "use server";

// import { redirect } from "next/navigation";

// export async function register(formData: FormData) {
//   const email = formData.get("email") as string;
//   const password = formData.get("password") as string;
//   const role = formData.get("role") as string;
//   const fullName = (formData.get("fullName") as string) || "";
//   const phone = (formData.get("phone") as string) || "";

//   if (!email || !password) {
//     return redirect(
//       `/register?message=${encodeURIComponent("Email and password are required")}`,
//     );
//   }

//   // Call your custom API route instead of supabase.auth.signUp() directly
//   // This uses Resend for email + correct redirectTo URL
//   const res = await fetch(
//     `${process.env.NEXT_PUBLIC_SITE_URL}/api/auth/register`,
//     {
//       method: "POST",
//       headers: { "Content-Type": "application/json" },
//       body: JSON.stringify({
//         email,
//         password,
//         fullName,
//         phone,
//         role: role || "buyer",
//       }),
//     },
//   );

//   const data = await res.json();

//   if (!res.ok) {
//     return redirect(
//       `/register?message=${encodeURIComponent(data.error || "Registration failed")}`,
//     );
//   }

//   // Redirect to verify-email page with email in query so resend button works
//   return redirect(`/verify-email?email=${encodeURIComponent(email)}`);
// }
