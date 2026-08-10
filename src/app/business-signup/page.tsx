"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { createClient } from "@/utils/supabase/client";
import { setCachedUser } from "@/lib/auth-cache";

const INFO: Record<string, { title: string; desc: string; docs: string }> = {
  agency: {
    title: "Real estate agency",
    desc: "For licensed agencies and property consultants.",
    docs: "Upload your business registration, RERA details and licence or credential documents.",
  },
  developer: {
    title: "Property owner or developer",
    desc: "For builders, owners and project teams.",
    docs: "Upload your business registration and ownership or project-authorisation documents.",
  },
};

export default function BusinessSignupPage() {
  const router = useRouter();
  const [selectedType, setSelectedType] = useState<"agency" | "developer" | null>(null);
  const [company, setCompany] = useState("");
  const [contactName, setContactName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [state, setState] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [agree, setAgree] = useState(false);
  const [notice, setNotice] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedType) return;
    setLoading(true);
    setNotice("");

    const supabase = createClient();
    const role = selectedType === "agency" ? "agent" : "developer";

    // Use custom API route to bypass Supabase SMTP rate limits and send via Resend directly
    const pwd = password || "PartnerPass@123";
    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          password: pwd,
          fullName: contactName,
          phone,
          role,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setNotice("Error creating account: " + (data.error || "Unknown error"));
        setLoading(false);
        return;
      }

      // If a warning is returned, it means the API bypassed email confirmation for testing
      const isEmailConfirmationRequired = !data.warning;
      const userId = data?.user?.id;

    if (userId && !isEmailConfirmationRequired) {
      // 2. Insert or update profile
      const { error: profileError } = await supabase.from("profiles").upsert({
        id: userId,
        full_name: contactName,
        phone,
        role,
        updated_at: new Date().toISOString(),
      });
      
      if (profileError) {
        console.warn("Profile upsert failed:", profileError);
      }

      // 3. Upload document if provided
      if (file) {
        try {
          const fileExt = file.name.split(".").pop();
          const filePath = `${userId}/${Date.now()}.${fileExt}`;

          const { error: uploadError } = await supabase.storage
            .from("user-verification-docs")
            .upload(filePath, file);

          if (!uploadError) {
            const { data: publicUrlData } = supabase.storage
              .from("user-verification-docs")
              .getPublicUrl(filePath);

            await supabase.from("user_verification_documents").insert({
              user_id: userId,
              document_type: selectedType === "agency" ? "Business Registration / RERA" : "Ownership / Developer Proof",
              storage_path: publicUrlData?.publicUrl || filePath,
              verification_status: "pending",
            });
          }
        } catch (docErr) {
          console.error("Doc upload error:", docErr);
        }
      }

      if (isEmailConfirmationRequired) {
        setNotice("✅ Registration successful! Please check your email to verify your account.");
        setTimeout(() => {
          router.push(`/verify-email?email=${encodeURIComponent(email)}`);
        }, 2000);
      } else {
        setCachedUser({
          email,
          name: contactName,
          role,
        });

        setNotice("✅ Account created successfully! Redirecting to your dashboard...");
        setTimeout(() => {
          router.push("/dashboard");
        }, 1200);
      }
    } else {
      setNotice("Account created. Please check your email to confirm registration.");
    }
    } catch (err: any) {
      console.error(err);
      setNotice("An unexpected error occurred: " + (err.message || ""));
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-white text-[#152230] font-sans">
      {/* Header */}
      <header className="max-w-[1200px] w-[calc(100%-48px)] max-md:w-[calc(100%-32px)] mx-auto h-[82px] max-md:h-[67px] border-b border-[#e1e5e8] flex items-center gap-[25px]">
        <Link href="/" className="font-bold tracking-[1px] text-[18px] flex items-center">
          <span className="inline-flex items-end gap-[2px] mr-2 h-[21px]">
            <i className="block w-[4px] h-[10px] bg-[#c98b2c]" />
            <i className="block w-[4px] h-[18px] bg-[#c98b2c]" />
            <i className="block w-[4px] h-[14px] bg-[#c98b2c]" />
          </span>
          Properties<span className="font-normal text-[#61707e]">Nexus</span>
        </Link>
        <nav className="border-l border-[#e1e5e8] pl-[25px] flex gap-[27px] text-[13px] font-semibold text-[#566573] max-md:hidden">
          <Link href="/#areas">Map</Link>
          <Link href="/properties">Properties</Link>
        </nav>
        <div className="ml-auto flex items-center gap-[9px] text-[12px] font-bold">
          <Link href="/#partners" className="p-[10px_15px] border border-[#e1e5e8] rounded-[22px] max-md:hidden">
            Become a partner
          </Link>
          <Link href="/login" className="p-[10px_15px] border border-[#e1e5e8] rounded-[22px] max-md:hidden">
            Log in
          </Link>
          <Link href="/register" className="p-[10px_15px] border border-[#e1e5e8] rounded-[22px]">
            Sign up
          </Link>
          <Link href="/business-signup" className="p-[10px_15px] bg-[#2862e8] border border-[#2862e8] text-white rounded-[22px] max-md:p-[9px_12px]">
            Partner sign up
          </Link>
        </div>
      </header>

      {/* Stage */}
      <main className="max-w-[514px] mx-auto p-[64px_0_85px] max-md:p-[42px_16px_55px]">
        {!selectedType ? (
          <div>
            <span className="table mx-auto mb-[20px] bg-[#edf4ff] border border-[#cee0ff] text-[#2661d7] rounded-[18px] p-[7px_12px] text-[10px] font-bold">
              PropertiesNexus Business Registration
            </span>
            <h1 className="text-center font-serif text-[42px] max-md:text-[35px] font-medium tracking-[-1.7px] m-0 mb-[8px]">
              Choose your business type
            </h1>
            <p className="text-center text-[#677684] text-[14px] m-0 mb-[31px] leading-[1.55]">
              Select the option that best describes how you work with property.
            </p>

            <div className="grid gap-[12px]">
              <button
                onClick={() => setSelectedType("agency")}
                className="w-full bg-white border border-[#d9dfe3] rounded-[15px] text-left cursor-pointer p-[21px] max-md:p-[17px] grid grid-cols-[47px_1fr_20px] max-md:grid-cols-[42px_1fr_17px] gap-[17px] max-md:gap-[13px] items-center hover:border-[#8cafd7] hover:shadow-[0_7px_18px_rgba(20,45,70,0.07)] transition-all"
              >
                <span className="w-[47px] h-[47px] max-md:w-[42px] max-md:h-[42px] grid place-items-center rounded-[14px] bg-[#f0f3f5] text-[#576675] text-[22px]">
                  ▦
                </span>
                <span>
                  <strong className="block text-[14px] mb-[6px] text-[#152230]">Real estate agency</strong>
                  <p className="m-0 text-[#6b7986] text-[12px] leading-[1.55]">
                    Licensed professionals or firms representing residential and commercial properties.
                  </p>
                  <small className="block text-[#71808c] text-[10px] mt-[9px]">
                    Verification: RERA details and business registration
                  </small>
                </span>
                <span className="text-[23px] text-[#778591]">›</span>
              </button>

              <button
                onClick={() => setSelectedType("developer")}
                className="w-full bg-white border border-[#d9dfe3] rounded-[15px] text-left cursor-pointer p-[21px] max-md:p-[17px] grid grid-cols-[47px_1fr_20px] max-md:grid-cols-[42px_1fr_17px] gap-[17px] max-md:gap-[13px] items-center hover:border-[#8cafd7] hover:shadow-[0_7px_18px_rgba(20,45,70,0.07)] transition-all"
              >
                <span className="w-[47px] h-[47px] max-md:w-[42px] max-md:h-[42px] grid place-items-center rounded-[14px] bg-[#f0f3f5] text-[#576675] text-[22px]">
                  ⌂
                </span>
                <span>
                  <strong className="block text-[14px] mb-[6px] text-[#152230]">Property owner or developer</strong>
                  <p className="m-0 text-[#6b7986] text-[12px] leading-[1.55]">
                    Builders, project teams, landlords and businesses marketing their own spaces.
                  </p>
                  <small className="block text-[#71808c] text-[10px] mt-[9px]">
                    Verification: Business registration and ownership details
                  </small>
                </span>
                <span className="text-[23px] text-[#778591]">›</span>
              </button>
            </div>
          </div>
        ) : (
          <div>
            <button
              onClick={() => setSelectedType(null)}
              className="border-0 bg-transparent p-0 text-[#657480] text-[13px] cursor-pointer mb-[25px] hover:underline font-semibold"
            >
              ← Back to business types
            </button>
            <h1 className="text-left font-serif text-[39px] max-md:text-[34px] font-medium tracking-[-1.5px] m-0 mb-[7px]">
              Create business account
            </h1>
            <p className="text-left text-[#677684] text-[14px] m-0 mb-[28px]">
              Set up your profile to list and manage your properties.
            </p>

            <div className="border border-[#e1e5e8] rounded-[14px] p-[17px_18px] grid grid-cols-[24px_1fr_auto] max-md:grid-cols-[20px_1fr] gap-[12px] max-md:gap-[9px] items-center bg-[#fbfcfc] mb-[17px]">
              <span className="text-green text-[20px]">✓</span>
              <div>
                <strong className="text-[13px] font-bold text-[#152230]">
                  {INFO[selectedType].title}
                </strong>
                <p className="m-0 mt-[3px] text-[11px] leading-[1.55] text-[#6a7885] max-md:col-start-2">
                  {INFO[selectedType].desc}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedType(null)}
                className="border-0 bg-transparent text-[11px] text-[#9b671c] underline cursor-pointer max-md:col-start-2 max-md:text-left font-semibold"
              >
                Change
              </button>
            </div>

            <form onSubmit={handleSubmit} className="border border-[#e1e5e8] rounded-[15px] p-[25px_31px] max-md:p-[21px]">
              <label className="block mb-[17px]">
                <span className="block text-[12px] font-bold mb-[8px]">Business name</span>
                <input
                  required
                  value={company}
                  onChange={(e) => setCompany(e.target.value)}
                  placeholder="Your company or firm name"
                  className="w-full border border-[#dbe1e5] rounded-[10px] h-[47px] px-[13px] outline-none bg-white text-[#344556] focus:border-[#7aa4d4] focus:shadow-[0_0_0_3px_rgba(40,98,232,0.11)] transition-all"
                />
              </label>

              <div className="grid grid-cols-2 max-md:grid-cols-1 gap-[13px] mb-[17px]">
                <label className="block">
                  <span className="block text-[12px] font-bold mb-[8px]">Contact name</span>
                  <input
                    required
                    value={contactName}
                    onChange={(e) => setContactName(e.target.value)}
                    placeholder="Full name"
                    className="w-full border border-[#dbe1e5] rounded-[10px] h-[47px] px-[13px] outline-none bg-white text-[#344556] focus:border-[#7aa4d4] focus:shadow-[0_0_0_3px_rgba(40,98,232,0.11)] transition-all"
                  />
                </label>
                <label className="block">
                  <span className="block text-[12px] font-bold mb-[8px]">Phone number</span>
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+91 00000 00000"
                    className="w-full border border-[#dbe1e5] rounded-[10px] h-[47px] px-[13px] outline-none bg-white text-[#344556] focus:border-[#7aa4d4] focus:shadow-[0_0_0_3px_rgba(40,98,232,0.11)] transition-all"
                  />
                </label>
              </div>

              <label className="block mb-[17px]">
                <span className="block text-[12px] font-bold mb-[8px]">Business email</span>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@company.com"
                  className="w-full border border-[#dbe1e5] rounded-[10px] h-[47px] px-[13px] outline-none bg-white text-[#344556] focus:border-[#7aa4d4] focus:shadow-[0_0_0_3px_rgba(40,98,232,0.11)] transition-all"
                />
              </label>

              <label className="block mb-[17px]">
                <span className="block text-[12px] font-bold mb-[8px]">Account Password</span>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Create password (min 6 characters)"
                  className="w-full border border-[#dbe1e5] rounded-[10px] h-[47px] px-[13px] outline-none bg-white text-[#344556] focus:border-[#7aa4d4] focus:shadow-[0_0_0_3px_rgba(40,98,232,0.11)] transition-all"
                />
              </label>

              <label className="block mb-[17px]">
                <span className="block text-[12px] font-bold mb-[8px]">State of registration</span>
                <select
                  required
                  value={state}
                  onChange={(e) => setState(e.target.value)}
                  className="w-full border border-[#dbe1e5] rounded-[10px] h-[47px] px-[13px] outline-none bg-white text-[#344556] focus:border-[#7aa4d4] focus:shadow-[0_0_0_3px_rgba(40,98,232,0.11)] transition-all"
                >
                  <option value="">Select state</option>
                  <option>Maharashtra</option>
                  <option>Karnataka</option>
                  <option>Delhi</option>
                  <option>Haryana</option>
                  <option>Telangana</option>
                  <option>Other</option>
                </select>
              </label>

              <div className="bg-[#f6f8fa] border border-dashed border-[#bdc9d2] rounded-[10px] p-[14px] text-[11px] text-[#62717e] my-[4px] mb-[18px]">
                <b className="text-[#374757] block mb-1">Required verification documents</b>
                {INFO[selectedType].docs}
                <input
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png"
                  onChange={(e) => setFile(e.target.files?.[0] || null)}
                  className="mt-[10px] text-[11px] block w-full"
                />
              </div>

              <label className="flex gap-[8px] text-[11px] text-[#687683] leading-[1.45] my-[19px] cursor-pointer font-normal">
                <input
                  type="checkbox"
                  required
                  checked={agree}
                  onChange={(e) => setAgree(e.target.checked)}
                  className="accent-[#2862e8] self-start mt-[2px]"
                />
                <span>
                  I confirm that the information is correct and agree to the{" "}
                  <a href="#" className="text-[#94621b] underline">Business Terms</a> and{" "}
                  <a href="#" className="text-[#94621b] underline">Privacy Policy</a>.
                </span>
              </label>

              <button
                type="submit"
                disabled={loading}
                className="w-full h-[49px] border-0 rounded-[9px] bg-[#07182d] hover:bg-[#112a4c] disabled:opacity-50 text-white font-bold cursor-pointer transition-colors"
              >
                {loading ? "Creating business account..." : "Create business account"}
              </button>

              {notice && (
                <p className="min-h-[19px] text-[11px] text-green-600 text-center mt-[11px] mb-0 font-semibold">
                  {notice}
                </p>
              )}
            </form>

            <p className="mt-[18px] text-center text-[#6d7b87] text-[12px]">
              Already registered?{" "}
              <Link href="/login" className="text-[#93601b] font-bold hover:underline">
                Log in
              </Link>
            </p>
          </div>
        )}
      </main>
    </div>
  );
}
