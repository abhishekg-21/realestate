import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function POST(request: Request) {
    try {
        const { email } = await request.json();
        if (!email) {
            return NextResponse.json({ error: "Email is required." }, { status: 400 });
        }

        const supabase = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
        );

        // resend with type "signup" triggers a new OTP for unconfirmed users
        const { error } = await supabase.auth.resend({
            type: "signup",
            email,
        });

        if (error) {
            return NextResponse.json({ error: error.message }, { status: 400 });
        }

        return NextResponse.json({ success: true });
    } catch (err: any) {
        return NextResponse.json(
            { error: err.message || "Failed to resend OTP." },
            { status: 500 }
        );
    }
}