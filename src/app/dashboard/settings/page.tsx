// src/app/user-dashboard/settings/page.tsx
"use client";

import { useState, useEffect } from "react";
import {
    getCachedUser,
    setCachedUser,
    AUTH_CHANGE_EVENT,
} from "@/lib/auth-cache";
import { createClient } from "@/utils/supabase/client";

export default function AccountSettingsPage() {
    const [nameInput, setNameInput] = useState("");
    const [emailInput, setEmailInput] = useState("");
    const [phoneInput, setPhoneInput] = useState("");
    const [locationInput, setLocationInput] = useState("");
    const [avatarInput, setAvatarInput] = useState("");
    const [toastMsg, setToastMsg] = useState("");
    const [saving, setSaving] = useState(false);

    const showToast = (text: string) => {
        setToastMsg(text);
        setTimeout(() => setToastMsg(""), 2500);
    };

    useEffect(() => {
        const loadState = async () => {
            const u = getCachedUser();
            if (u) {
                setNameInput(u.name || "");
                setEmailInput(u.email || "");
                if (u.avatar?.startsWith("data:image")) setAvatarInput(u.avatar);
            }

            const supabase = createClient();
            const { data: { user } } = await supabase.auth.getUser();

            if (!user) return; // ← null check fixes TS18047

            const { data: profile } = await supabase
                .from("profiles")
                .select("full_name, phone, location, avatar_url") // ← single query with all fields
                .eq("id", user.id)
                .single();

            if (profile) {
                if (profile.full_name) setNameInput(profile.full_name);
                if (profile.phone) setPhoneInput(profile.phone);
                if (profile.location) setLocationInput(profile.location);
                if (profile.avatar_url) setAvatarInput(profile.avatar_url);
            }
        };

        loadState();
        window.addEventListener(AUTH_CHANGE_EVENT, loadState);
        return () => window.removeEventListener(AUTH_CHANGE_EVENT, loadState);
    }, []);

    const [locationLoading, setLocationLoading] = useState(false);

    const detectLocation = async () => {
        if (!navigator.geolocation) {
            showToast("Geolocation is not supported by your browser.");
            return;
        }
        setLocationLoading(true);
        navigator.geolocation.getCurrentPosition(
            async (pos) => {
                try {
                    const { latitude, longitude } = pos.coords;
                    const res = await fetch(
                        `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`
                    );
                    const data = await res.json();
                    const city =
                        data.address?.city ||
                        data.address?.town ||
                        data.address?.village ||
                        data.address?.county ||
                        "";
                    const state = data.address?.state || "";
                    const country = data.address?.country || "";
                    const formatted = [city, state, country].filter(Boolean).join(", ");
                    setLocationInput(formatted);
                    showToast("Location detected successfully.");
                } catch {
                    showToast("Could not fetch location details.");
                } finally {
                    setLocationLoading(false);
                }
            },
            () => {
                showToast("Location access denied. Please allow it in your browser.");
                setLocationLoading(false);
            }
        );
    };

    const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Show preview immediately
        const reader = new FileReader();
        reader.onload = (ev) => {
            if (ev.target?.result) setAvatarInput(ev.target.result as string);
        };
        reader.readAsDataURL(file);

        // Upload to Supabase Storage
        try {
            const supabase = createClient();
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            const fileExt = file.name.split(".").pop();
            const filePath = `${user.id}/avatar.${fileExt}`; // overwrite old avatar

            const { error: uploadError } = await supabase.storage
                .from("avatars")
                .upload(filePath, file, { upsert: true });

            if (uploadError) {
                showToast("Image upload failed: " + uploadError.message);
                return;
            }

            // Get public URL
            const { data: urlData } = supabase.storage
                .from("avatars")
                .getPublicUrl(filePath);

            const publicUrl = urlData.publicUrl;

            // Save URL to profiles table
            await supabase
                .from("profiles")
                .update({ avatar_url: publicUrl })
                .eq("id", user.id);

            // Update local cache
            setCachedUser({
                ...getCachedUser()!,
                avatar: publicUrl,
            });

            showToast("Profile picture updated.");
        } catch {
            showToast("Something went wrong uploading your image.");
        }
    };

    const handleSave = async () => {
        if (!nameInput.trim()) return;
        setSaving(true);
        try {
            const supabase = createClient();
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                await supabase
                    .from("profiles")
                    .update({
                        full_name: nameInput.trim(),
                        phone: phoneInput.trim(),
                        location: locationInput.trim(),   // ← add this
                    })
                    .eq("id", user.id);
            }
            setCachedUser({
                name: nameInput.trim(),
                email: emailInput,
                role: getCachedUser()?.role || "buyer",
                avatar: avatarInput,
            });
            showToast("Profile updated successfully.");
        } catch {
            showToast("Something went wrong. Please try again.");
        } finally {
            setSaving(false);
        }
    };

    const handlePasswordReset = async () => {
        if (!emailInput) return;
        const supabase = createClient();
        await supabase.auth.resetPasswordForEmail(emailInput, {
            redirectTo: `${window.location.origin}/reset-password`,
        });
        showToast("Password reset email sent. Check your inbox.");
    };

    return (
        <div className="flex flex-col min-h-screen bg-paper font-sans">
            {/* Header */}
            <header className="h-[74px] max-md:h-[63px] bg-white border-b border-line flex items-center px-[clamp(20px,4vw,52px)] max-md:px-[16px] gap-[20px]">
                <span className="text-[12px] text-[#74828d]">My account / Account settings</span>
            </header>

            <div className="max-w-[1280px] w-full p-[37px_clamp(20px,4vw,52px)_70px] max-md:p-[25px_16px_55px] mx-auto flex-1">

                {/* Page heading */}
                <div className="flex items-end justify-between mb-[28px]">
                    <div>
                        <h1 className="font-serif text-[34px] max-sm:text-[28px] font-medium tracking-[-1.6px] m-0 text-ink">
                            Account studio
                        </h1>
                        <p className="text-[12px] text-muted mt-[7px] mb-0">
                            Make this space work the way you do.
                        </p>
                    </div>
                </div>

                <div className="grid gap-[15px]">

                    {/* ── Profile ── */}
                    <section className="border border-line bg-white p-[22px] rounded">
                        <h2 className="text-[15px] font-bold m-0 mb-[5px] text-ink">Profile</h2>
                        <p className="text-[11px] text-muted m-0 mb-[18px]">Your visible account details.</p>

                        <div className="grid grid-cols-[auto_1fr] max-sm:grid-cols-1 gap-[18px] items-start">
                            {/* Avatar */}
                            <div className="flex flex-col gap-[7px]">
                                <span className="block text-[11px] font-bold text-ink">Profile picture</span>
                                <label className="cursor-pointer shrink-0 block relative group">
                                    <div className="h-[70px] w-[70px] rounded-full bg-slate-100 border border-slate-200 overflow-hidden flex items-center justify-center relative shadow-sm">
                                        {avatarInput ? (
                                            <img src={avatarInput} alt="Avatar Preview" className="w-full h-full object-cover" />
                                        ) : (
                                            <span className="text-slate-400 text-3xl">👤</span>
                                        )}
                                        <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                            <span className="text-white text-xs font-bold">Edit</span>
                                        </div>
                                    </div>
                                    <input type="file" accept="image/*" onChange={handleAvatarUpload} className="hidden" />
                                </label>
                            </div>

                            {/* Fields */}
                            <div className="grid grid-cols-2 max-sm:grid-cols-1 gap-[12px]">
                                <label className="block">
                                    <span className="block text-[11px] font-bold text-ink mb-[7px]">Display name</span>
                                    <input
                                        type="text"
                                        value={nameInput}
                                        onChange={(e) => setNameInput(e.target.value)}
                                        placeholder="Your full name"
                                        className="border border-line rounded-[7px] w-full p-[10px] text-[12px] bg-white text-ink outline-0 focus:border-[#d49a38] transition-colors"
                                    />
                                </label>
                                <label className="block">
                                    <span className="block text-[11px] font-bold text-ink mb-[7px]">Email address</span>
                                    <input
                                        type="email"
                                        value={emailInput}
                                        onChange={(e) => setEmailInput(e.target.value)}
                                        placeholder="your@email.com"
                                        className="border border-line rounded-[7px] w-full p-[10px] text-[12px] bg-white text-ink outline-0 focus:border-[#d49a38] transition-colors"
                                    />
                                </label>
                                <label className="block">
                                    <span className="block text-[11px] font-bold text-ink mb-[7px]">Phone number</span>
                                    <input
                                        type="tel"
                                        value={phoneInput}
                                        onChange={(e) => setPhoneInput(e.target.value)}
                                        placeholder="+91 00000 00000"
                                        className="border border-line rounded-[7px] w-full p-[10px] text-[12px] bg-white text-ink outline-0 focus:border-[#d49a38] transition-colors"
                                    />
                                </label>
                                <label className="block">
                                    <span className="block text-[11px] font-bold text-ink mb-[7px]">Location</span>
                                    <div className="flex gap-[8px]">
                                        <input
                                            type="text"
                                            value={locationInput}
                                            onChange={(e) => setLocationInput(e.target.value)}
                                            placeholder="City, India"
                                            className="border border-line rounded-[7px] flex-1 p-[10px] text-[12px] bg-white text-ink outline-0 focus:border-[#d49a38] transition-colors"
                                        />
                                        <button
                                            type="button"
                                            onClick={detectLocation}
                                            disabled={locationLoading}
                                            title="Detect my location"
                                            className="border border-line rounded-[7px] px-[10px] text-[14px] bg-white hover:bg-gray-50 transition-colors cursor-pointer disabled:opacity-50 shrink-0"
                                        >
                                            {locationLoading ? (
                                                <span className="inline-block w-[14px] h-[14px] border-2 border-[#d49a38] border-t-transparent rounded-full animate-spin" />
                                            ) : (
                                                "📍"
                                            )}
                                        </button>
                                    </div>
                                    <span className="block text-[10px] text-muted mt-[5px]">
                                        Type manually or tap 📍 to detect automatically.
                                    </span>
                                </label>
                                <div className="col-span-full mt-1">
                                    <button
                                        onClick={handleSave}
                                        disabled={saving}
                                        className="border-0 rounded-[7px] bg-navy !text-white p-[11px_24px] text-[12px] font-bold cursor-pointer hover:bg-navy2 transition-colors disabled:opacity-50"
                                    >
                                        {saving ? "Saving…" : "Save changes"}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* ── Notifications ── */}
                    <section className="border border-line bg-white p-[22px] rounded">
                        <h2 className="text-[15px] font-bold m-0 mb-[5px] text-ink">Notifications</h2>
                        <p className="text-[11px] text-muted m-0 mb-[16px]">Choose the updates you would like to receive.</p>

                        {[
                            {
                                label: "Property matches",
                                desc: "Receive updates when a new property matches an active alert.",
                                defaultOn: true,
                            },
                            {
                                label: "Saved property changes",
                                desc: "Get important availability and price updates for saved homes.",
                                defaultOn: true,
                            },
                            {
                                label: "PropertiesNexus weekly edit",
                                desc: "A concise roundup of noteworthy new addresses.",
                                defaultOn: false,
                            },
                        ].map((item, i, arr) => (
                            <div
                                key={item.label}
                                className={`flex justify-between items-center py-[15px] ${i < arr.length - 1 ? "border-b border-[#edf0f1]" : ""}`}
                            >
                                <div>
                                    <b className="block text-[12px] font-bold text-ink">{item.label}</b>
                                    <p className="text-[10px] text-muted m-0 mt-[4px] max-w-[540px]">{item.desc}</p>
                                </div>
                                <input
                                    type="checkbox"
                                    defaultChecked={item.defaultOn}
                                    onChange={() => showToast("Preference saved.")}
                                    className="w-[38px] h-[22px] rounded-[15px] bg-[#bdc5c9] checked:bg-navy appearance-none relative cursor-pointer transition-colors after:content-[''] after:h-[16px] after:w-[16px] after:bg-white after:rounded-full after:absolute after:top-[3px] after:left-[3px] checked:after:left-[19px] after:transition-all"
                                />
                            </div>
                        ))}
                    </section>

                    {/* ── Account Safety ── */}
                    <section className="border border-line bg-white p-[22px] rounded">
                        <h2 className="text-[15px] font-bold m-0 mb-[5px] text-ink">Account safety</h2>
                        <p className="text-[11px] text-muted m-0 mb-[18px]">
                            Manage your password and account security.
                        </p>

                        <div className="flex flex-wrap gap-[10px]">
                            <button
                                onClick={handlePasswordReset}
                                className="border border-[#b6c1c6] rounded-[7px] bg-white text-[#324453] p-[10px_13px] text-[12px] font-bold cursor-pointer hover:bg-gray-50 transition-colors"
                            >
                                Send password reset email
                            </button>
                            <button
                                onClick={() => showToast("Two-factor authentication coming soon.")}
                                className="border border-[#b6c1c6] rounded-[7px] bg-white text-[#324453] p-[10px_13px] text-[12px] font-bold cursor-pointer hover:bg-gray-50 transition-colors"
                            >
                                Enable two-factor auth
                            </button>
                        </div>
                    </section>

                    {/* ── Danger Zone ── */}
                    <section className="border border-red/30 bg-white p-[22px] rounded">
                        <h2 className="text-[15px] font-bold m-0 mb-[5px] text-red">Danger zone</h2>
                        <p className="text-[11px] text-muted m-0 mb-[18px]">
                            Permanent actions that cannot be undone.
                        </p>
                        <button
                            onClick={() => showToast("To delete your account, please contact support@propertiesnexus.com")}
                            className="border border-red/40 rounded-[7px] bg-white text-red p-[10px_13px] text-[12px] font-bold cursor-pointer hover:bg-red/5 transition-colors"
                        >
                            Delete my account
                        </button>
                    </section>

                </div>
            </div>

            {toastMsg && (
                <div className="fixed bottom-[20px] right-[20px] bg-[#143b60] text-white p-[12px_15px] rounded-[7px] text-[12px] shadow-[0_8px_22px_rgba(0,0,0,0.2)] z-50 animate-bounce">
                    {toastMsg}
                </div>
            )}
        </div>
    );
}