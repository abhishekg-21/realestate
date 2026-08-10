require("dotenv").config({ path: ".env.local" });
const { createClient } = require("@supabase/supabase-js");

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

async function test() {
  const { data, error } = await supabase.auth.signInWithPassword({
    email: "dhanushkumarm2709@gmail.com",
    password: "password123", // any password
  });
  console.log("Error:", error?.message);
  console.log("Session:", !!data?.session);
}
test();
