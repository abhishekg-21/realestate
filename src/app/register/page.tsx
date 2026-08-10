"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import { setCachedUser } from "@/lib/auth-cache";
import AuthLayout from "@/components/auth-layout";

const ROLES = [
  {
    value: "buyer",
    label: "Buyer",
    icon: "🏠",
    desc: "Looking to buy or rent a property",
    docsRequired: "No documents required",
  },
  {
    value: "seller",
    label: "Property Owner / Seller",
    icon: "🔑",
    desc: "Owner listing properties for sale or lease",
    docsRequired: "Ownership Proof + Identity Proof",
  },
  {
    value: "agent",
    label: "Broker / Real Estate Agent",
    icon: "🤝",
    desc: "Licensed agent or brokerage firm",
    docsRequired: "Identity Proof + RERA Certificate",
  },
  {
    value: "builder",
    label: "Builder",
    icon: "🏗️",
    desc: "Building housing projects & townships",
    docsRequired: "Certificate of Incorporation (COI) + RERA",
  },
  {
    value: "developer",
    label: "Developer",
    icon: "🏢",
    desc: "Real estate development enterprise",
    docsRequired: "COI + RERA Certificate",
  },
  {
    value: "investor",
    label: "Investor",
    icon: "💼",
    desc: "Institutional or individual real estate investor",
    docsRequired: "Identity Proof (+ COI if company)",
  },
];

export default function RegisterPage() {
  const router = useRouter();
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [selectedRole, setSelectedRole] = useState("buyer");
  const [first, setFirst] = useState("");
  const [last, setLast] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [terms, setTerms] = useState(false);
  const [msg, setMsg] = useState("");
  const [msgType, setMsgType] = useState<"error" | "success">("error");
  const [loading, setLoading] = useState(false);

  // Role Document Upload State
  const [ownershipDocType, setOwnershipDocType] = useState("Registered Sale Deed");
  const [identityDocType, setIdentityDocType] = useState("Aadhaar Card");
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    const files = Array.from(e.target.files);
    setUploadedFiles((prev) => [...prev, ...files]);
  };

  const removeFile = (idx: number) => {
    setUploadedFiles((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleNextStep1 = () => {
    if (!selectedRole) {
      setMsg("Please select an account type.");
      setMsgType("error");
      return;
    }
    setStep(2);
  };

  const handleNextStep2 = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedRole === "buyer") {
      handleRegister();
    } else {
      setStep(3);
    }
  };

  const handleRegister = async () => {
    setLoading(true);
    setMsg("Creating account & storing credentials…");
    setMsgType("success");

    const fullName = `${first} ${last}`.trim() || email.split("@")[0];

    try {
      const supabase = createClient();
      
      // Use custom API route to bypass Supabase SMTP rate limits and send via Resend directly
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          password,
          fullName,
          phone,
          role: selectedRole,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setMsg(data.error || "An error occurred during registration.");
        setMsgType("error");
        setLoading(false);
        return;
      }

      // We assume email confirmation is always required
      const isEmailConfirmationRequired = true;

      // Upsert user profile only if they are logged in (no email confirmation required)
      const userId = data?.user?.id;
      if (userId && !isEmailConfirmationRequired) {
        const { error: profileError } = await supabase.from("profiles").upsert({
          id: userId,
          full_name: fullName,
          phone,
          role: selectedRole,
        });
        
        if (profileError) {
          console.warn("Profile upsert failed:", profileError);
        }

        // Store verification documents in Supabase Storage if files uploaded
        if (uploadedFiles.length > 0) {
          for (const file of uploadedFiles) {
            const path = `${userId}/${Date.now()}_${file.name}`;
            const { error: uploadError } = await supabase.storage
              .from("user-verification-docs")
              .upload(path, file);
              
            if (!uploadError) {
              await supabase.from("user_verification_documents").insert({
                user_id: userId,
                role: selectedRole,
                doc_category: selectedRole === "seller" ? "ownership_proof" : "identity_proof",
                doc_type: selectedRole === "seller" ? ownershipDocType : identityDocType,
                storage_path: path,
                file_name: file.name,
                verification_status: "pending",
              });
            }
          }
        }
      }

      if (isEmailConfirmationRequired) {
        setMsg("Registration successful! Please check your email to verify your account.");
        setMsgType("success");
        setLoading(false);
        setTimeout(() => {
          router.push(`/verify-email?email=${encodeURIComponent(email)}`);
        }, 2000);
      } else {
        setCachedUser({
          name: fullName,
          email: data.user?.email || email,
          role: selectedRole,
        });

        setMsg("Account created successfully! Redirecting…");
        setMsgType("success");
        setTimeout(() => {
          router.push("/user-dashboard");
        }, 800);
      }
    } catch (err: any) {
      setMsg(err.message || "An unexpected error occurred.");
      setMsgType("error");
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      eyebrow="PropertiesNexus Verification Network"
      title="Create your account"
      highlightedWord="account"
      description="Select your role and submit verification documents for immediate access to listing and investment tools."
      fact1Value="100%"
      fact1Label="Verified platform"
      fact2Value="6"
      fact2Label="User Role Types"
    >
      <h2 className="font-serif text-[34px] max-md:text-[28px] font-medium tracking-[-1px] m-0 mb-[6px] text-ink">
        Join PropertiesNexus
      </h2>
      <p className="text-[13px] leading-[1.6] text-muted m-0 mb-[20px]">
        Official registration for Buyers, Sellers, Agents, Builders, Developers & Investors.
      </p>

      {/* Step Indicator */}
      <div className="flex items-center gap-[8px] mb-[24px]">
        <div className={`w-[24px] h-[24px] rounded-full flex items-center justify-center text-[11px] font-bold ${step >= 1 ? "bg-navy !text-white" : "bg-slate-200 text-slate-600"}`}>
          1
        </div>
        <span className="text-[11px] font-bold text-slate-700">Role</span>
        <div className="flex-1 h-[1px] bg-slate-200" />
        <div className={`w-[24px] h-[24px] rounded-full flex items-center justify-center text-[11px] font-bold ${step >= 2 ? "bg-navy !text-white" : "bg-slate-200 text-slate-600"}`}>
          2
        </div>
        <span className="text-[11px] font-bold text-slate-700">Details</span>
        {selectedRole !== "buyer" && (
          <>
            <div className="flex-1 h-[1px] bg-slate-200" />
            <div className={`w-[24px] h-[24px] rounded-full flex items-center justify-center text-[11px] font-bold ${step === 3 ? "bg-navy !text-white" : "bg-slate-200 text-slate-600"}`}>
              3
            </div>
            <span className="text-[11px] font-bold text-slate-700">Docs</span>
          </>
        )}
      </div>

      {/* STEP 1: Select Role */}
      {step === 1 && (
        <div>
          <p className="text-[12px] font-bold text-ink mb-[12px] uppercase tracking-wider">
            Select your account type:
          </p>
          <div className="grid grid-cols-2 max-sm:grid-cols-1 gap-[10px] mb-[24px]">
            {ROLES.map((r) => (
              <button
                key={r.value}
                type="button"
                onClick={() => setSelectedRole(r.value)}
                className={`flex flex-col text-left p-[14px] rounded-xl border-2 transition-all cursor-pointer ${
                  selectedRole === r.value
                    ? "border-[#d49a38] bg-amber-50/40 shadow-sm"
                    : "border-slate-200 bg-white hover:border-slate-300"
                }`}
              >
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-[22px]">{r.icon}</span>
                  <span className="text-[13px] font-bold text-slate-900">{r.label}</span>
                </div>
                <p className="text-[11px] text-slate-500 mb-2 line-clamp-2 leading-tight">
                  {r.desc}
                </p>
                <span className="mt-auto text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded w-max">
                  📋 {r.docsRequired}
                </span>
              </button>
            ))}
          </div>

          <button
            type="button"
            onClick={handleNextStep1}
            className="h-[48px] border-0 rounded-xl bg-navy hover:bg-navy2 text-white w-full text-[13px] font-bold cursor-pointer transition-colors shadow-sm"
          >
            Continue →
          </button>
        </div>
      )}

      {/* STEP 2: Basic User Details */}
      {step === 2 && (
        <form onSubmit={handleNextStep2} className="flex flex-col">
          <div className="flex items-center gap-2 mb-4 p-3 bg-slate-50 border border-slate-200 rounded-xl">
            <span className="text-[20px]">{ROLES.find(r => r.value === selectedRole)?.icon}</span>
            <div>
              <span className="block text-[12px] font-bold text-slate-900">{ROLES.find(r => r.value === selectedRole)?.label}</span>
              <span className="text-[10px] text-slate-500">{ROLES.find(r => r.value === selectedRole)?.docsRequired}</span>
            </div>
            <button type="button" onClick={() => setStep(1)} className="ml-auto text-[11px] text-[#d49a38] font-bold hover:underline">
              Change
            </button>
          </div>

          <div className="grid grid-cols-2 max-sm:grid-cols-1 gap-[12px] my-[6px]">
            <label className="block">
              <span className="block text-[11px] font-bold text-ink mb-[5px]">First name</span>
              <input
                type="text"
                required
                value={first}
                onChange={(e) => setFirst(e.target.value)}
                placeholder="First name"
                className="w-full h-[45px] border border-slate-300 rounded-xl px-[12px] text-[13px] outline-none bg-white focus:border-[#d49a38]"
              />
            </label>
            <label className="block">
              <span className="block text-[11px] font-bold text-ink mb-[5px]">Last name</span>
              <input
                type="text"
                required
                value={last}
                onChange={(e) => setLast(e.target.value)}
                placeholder="Last name"
                className="w-full h-[45px] border border-slate-300 rounded-xl px-[12px] text-[13px] outline-none bg-white focus:border-[#d49a38]"
              />
            </label>
          </div>

          <label className="block my-[6px]">
            <span className="block text-[11px] font-bold text-ink mb-[5px]">Email address</span>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="w-full h-[45px] border border-slate-300 rounded-xl px-[12px] text-[13px] outline-none bg-white focus:border-[#d49a38]"
            />
          </label>

          <label className="block my-[6px]">
            <span className="block text-[11px] font-bold text-ink mb-[5px]">Phone number</span>
            <input
              type="tel"
              required
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+91 98765 43210"
              className="w-full h-[45px] border border-slate-300 rounded-xl px-[12px] text-[13px] outline-none bg-white focus:border-[#d49a38]"
            />
          </label>

          <label className="block my-[6px] relative">
            <span className="block text-[11px] font-bold text-ink mb-[5px]">Password</span>
            <input
              type={showPassword ? "text" : "password"}
              required
              minLength={8}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="At least 8 characters"
              className="w-full h-[45px] border border-slate-300 rounded-xl px-[12px] text-[13px] outline-none bg-white focus:border-[#d49a38] pr-[50px]"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-[12px] bottom-[13px] text-[11px] font-bold text-slate-500 hover:text-slate-900"
            >
              {showPassword ? "Hide" : "Show"}
            </button>
          </label>

          <label className="flex items-center gap-[8px] text-[11px] my-[10px] text-slate-600 font-normal">
            <input
              type="checkbox"
              required
              checked={terms}
              onChange={(e) => setTerms(e.target.checked)}
              className="rounded border-slate-300"
            />
            I agree to the Terms and Privacy Policy.
          </label>

          <button
            type="submit"
            disabled={loading}
            className="h-[48px] border-0 rounded-xl bg-navy hover:bg-navy2 text-white w-full text-[13px] font-bold cursor-pointer mt-[6px] transition-colors shadow-sm disabled:opacity-60"
          >
            {selectedRole === "buyer" ? (loading ? "Creating account…" : "Complete Registration") : "Continue to Verification Docs →"}
          </button>
        </form>
      )}

      {/* STEP 3: Role-Specific Verification Documents */}
      {step === 3 && (
        <div className="flex flex-col gap-4">
          <div className="bg-amber-50 border border-amber-200 p-4 rounded-xl text-[12px] text-amber-900">
            <h3 className="font-bold text-[14px] mb-1">
              Verification Documents for {ROLES.find(r => r.value === selectedRole)?.label}
            </h3>
            <p className="m-0 leading-relaxed">
              To verify your role in Supabase, please select and upload your required documents below.
            </p>
          </div>

          {/* Seller Document Options */}
          {selectedRole === "seller" && (
            <div className="space-y-3">
              <label className="block">
                <span className="block text-[11px] font-bold text-slate-900 mb-1">A. Property Ownership Proof (Upload any ONE)</span>
                <select
                  value={ownershipDocType}
                  onChange={(e) => setOwnershipDocType(e.target.value)}
                  className="w-full h-[42px] border border-slate-300 rounded-xl px-3 text-[12px] bg-white outline-none"
                >
                  <option>Registered Sale Deed</option>
                  <option>Title Deed</option>
                  <option>Conveyance Deed</option>
                  <option>Allotment Letter (for new properties)</option>
                  <option>Inheritance/Probate Documents</option>
                </select>
              </label>

              <label className="block">
                <span className="block text-[11px] font-bold text-slate-900 mb-1">B. Identity Proof (Upload any ONE)</span>
                <select
                  value={identityDocType}
                  onChange={(e) => setIdentityDocType(e.target.value)}
                  className="w-full h-[42px] border border-slate-300 rounded-xl px-3 text-[12px] bg-white outline-none"
                >
                  <option>Aadhaar Card</option>
                  <option>PAN Card</option>
                  <option>Passport</option>
                  <option>Driving Licence</option>
                  <option>Voter ID</option>
                </select>
              </label>
            </div>
          )}

          {/* Broker / Agent Document Options */}
          {selectedRole === "agent" && (
            <div className="space-y-3">
              <label className="block">
                <span className="block text-[11px] font-bold text-slate-900 mb-1">A. Identity Proof (Upload any ONE)</span>
                <select
                  value={identityDocType}
                  onChange={(e) => setIdentityDocType(e.target.value)}
                  className="w-full h-[42px] border border-slate-300 rounded-xl px-3 text-[12px] bg-white outline-none"
                >
                  <option>Aadhaar Card</option>
                  <option>PAN Card</option>
                  <option>Passport</option>
                  <option>Driving Licence</option>
                </select>
              </label>
              <label className="block">
                <span className="block text-[11px] font-bold text-slate-900 mb-1">B. Professional Document (Mandatory if RERA applicable)</span>
                <select
                  value={ownershipDocType}
                  onChange={(e) => setOwnershipDocType(e.target.value)}
                  className="w-full h-[42px] border border-slate-300 rounded-xl px-3 text-[12px] bg-white outline-none"
                >
                  <option>RERA Registration Certificate</option>
                  <option>GST Registration Certificate (Optional)</option>
                  <option>Shop & Establishment Certificate (Optional)</option>
                </select>
              </label>
            </div>
          )}

          {/* Builder Document Options */}
          {selectedRole === "builder" && (
            <div className="space-y-3">
              <label className="block">
                <span className="block text-[11px] font-bold text-slate-900 mb-1">Mandatory & Optional Company Documents</span>
                <select
                  value={ownershipDocType}
                  onChange={(e) => setOwnershipDocType(e.target.value)}
                  className="w-full h-[42px] border border-slate-300 rounded-xl px-3 text-[12px] bg-white outline-none"
                >
                  <option>Certificate of Incorporation (COI) / Company Registration</option>
                  <option>RERA Registration Certificate</option>
                  <option>GST Registration Certificate</option>
                  <option>PAN Card of Company</option>
                  <option>MSME / Udyam Registration Certificate</option>
                </select>
              </label>
            </div>
          )}

          {/* Developer Document Options */}
          {selectedRole === "developer" && (
            <div className="space-y-3">
              <label className="block">
                <span className="block text-[11px] font-bold text-slate-900 mb-1">Company Documents (Mandatory & Optional)</span>
                <select
                  value={ownershipDocType}
                  onChange={(e) => setOwnershipDocType(e.target.value)}
                  className="w-full h-[42px] border border-slate-300 rounded-xl px-3 text-[12px] bg-white outline-none"
                >
                  <option>Certificate of Incorporation (COI)</option>
                  <option>RERA Registration Certificate</option>
                  <option>GST Registration Certificate</option>
                  <option>Company PAN Card</option>
                  <option>MSME / Udyam Registration Certificate</option>
                </select>
              </label>
            </div>
          )}

          {/* Investor Document Options */}
          {selectedRole === "investor" && (
            <div className="space-y-3">
              <label className="block">
                <span className="block text-[11px] font-bold text-slate-900 mb-1">A. Identity Proof (Upload any ONE)</span>
                <select
                  value={identityDocType}
                  onChange={(e) => setIdentityDocType(e.target.value)}
                  className="w-full h-[42px] border border-slate-300 rounded-xl px-3 text-[12px] bg-white outline-none"
                >
                  <option>Aadhaar Card</option>
                  <option>PAN Card</option>
                  <option>Passport</option>
                </select>
              </label>
              <label className="block">
                <span className="block text-[11px] font-bold text-slate-900 mb-1">B. Company / Tax Documents (If applicable)</span>
                <select
                  value={ownershipDocType}
                  onChange={(e) => setOwnershipDocType(e.target.value)}
                  className="w-full h-[42px] border border-slate-300 rounded-xl px-3 text-[12px] bg-white outline-none"
                >
                  <option>Certificate of Incorporation (Company Investors)</option>
                  <option>GST Registration Certificate</option>
                </select>
              </label>
            </div>
          )}

          {/* Upload Dropzone */}
          <label className="block border-2 border-dashed border-slate-300 p-6 text-center bg-slate-50 rounded-2xl cursor-pointer hover:bg-slate-100 transition-colors">
            <input
              type="file"
              accept="application/pdf,image/jpeg,image/png,image/webp"
              multiple
              onChange={handleFileUpload}
              className="hidden"
            />
            <span className="block text-2xl mb-1">📁</span>
            <b className="text-[12px] text-slate-900 font-bold block mb-0.5">Click to upload verification files</b>
            <span className="text-[11px] text-slate-500">PDF, JPG, PNG or WebP up to 50 MB each</span>
          </label>

          {uploadedFiles.length > 0 && (
            <div className="space-y-2">
              <span className="text-[11px] font-bold text-slate-800">Uploaded Files ({uploadedFiles.length}):</span>
              {uploadedFiles.map((file, idx) => (
                <div key={idx} className="flex justify-between items-center bg-white p-2.5 rounded-xl border border-slate-200 text-[11px]">
                  <span className="font-semibold text-slate-900 truncate">{file.name}</span>
                  <button type="button" onClick={() => removeFile(idx)} className="text-red-600 font-bold hover:underline ml-2">
                    Remove
                  </button>
                </div>
              ))}
            </div>
          )}

          <div className="flex gap-3 mt-3">
            <button
              type="button"
              onClick={() => setStep(2)}
              className="h-[48px] border border-slate-300 rounded-xl bg-white text-slate-700 px-5 text-[13px] font-bold hover:bg-slate-50 transition-colors"
            >
              ← Back
            </button>
            <button
              type="button"
              onClick={handleRegister}
              disabled={loading}
              className="flex-1 h-[48px] border-0 rounded-xl bg-navy hover:bg-navy2 text-white text-[13px] font-bold transition-colors shadow-sm disabled:opacity-60"
            >
              {loading ? "Registering & Uploading…" : "Complete Registration & Submit Docs"}
            </button>
          </div>
        </div>
      )}

      {msg && (
        <p
          className={`text-[12px] leading-[1.5] text-center my-[14px] font-semibold ${
            msgType === "success" ? "text-emerald-600" : "text-red-600"
          }`}
          aria-live="polite"
        >
          {msg}
        </p>
      )}

      <p className="text-center text-[12px] text-[#687783] mt-[22px] mb-0">
        Already have an account?{" "}
        <Link href="/login" className="text-[#d49a38] font-bold hover:underline">
          Sign in
        </Link>
      </p>
    </AuthLayout>
  );
}
