"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { PROPERTIES, Property } from "@/lib/properties-data";
import {
  getCachedUser,
  setCachedUser,
  getSavedPropertyIds,
  toggleSavedPropertyId,
  AUTH_CHANGE_EVENT,
  SAVED_CHANGE_EVENT,
} from "@/lib/auth-cache";
import { createClient } from "@/utils/supabase/client";

interface AlertItem {
  name: string;
  detail: string;
  on: boolean;
}

interface ListingItem {
  title: string;
  type: string;
  city: string;
  price: string;
  beds: string;
  status: string;
}

interface MessageThread {
  name: string;
  topic: string;
  messages: [string, string][];
}

function UserDashboardContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const currentView = searchParams.get("view") || "overview";

  const [userName, setUserName] = useState("");
  const [userEmail, setUserEmail] = useState("");
  const [nameInput, setNameInput] = useState("");
  const [emailInput, setEmailInput] = useState("");
  const [phoneInput, setPhoneInput] = useState("");
  const [locationInput, setLocationInput] = useState("");
  const [userAvatar, setUserAvatar] = useState("");
  const [avatarInput, setAvatarInput] = useState("");
  const [profileLoading, setProfileLoading] = useState(true);

  const [alerts, setAlerts] = useState<AlertItem[]>([
    {
      name: "3-bedroom homes in Mumbai",
      detail: "Buy · Apartment or villa · ₹ 2 Cr to ₹ 10 Cr",
      on: true,
    },
    {
      name: "Villas in Goa",
      detail: "Rent · 3+ bedrooms · Any budget",
      on: true,
    },
  ]);
  const [listings, setListings] = useState<ListingItem[]>([
    {
      title: "Bandra Atelier",
      type: "Apartment",
      city: "Mumbai",
      price: "₹ 98k / mo",
      beds: "2",
      status: "Live",
    },
  ]);
  const [messages, setMessages] = useState<MessageThread[]>([
    {
      name: "Maya · Property advisor",
      topic: "Skyline Residences",
      messages: [
        [
          "advisor",
          "Hello Aarav, I can help arrange a viewing for Skyline Residences.",
        ],
        ["you", "Thank you. I would like to see it this weekend."],
      ],
    },
  ]);
  const [activeThread, setActiveThread] = useState(0);
  const [replyText, setReplyText] = useState("");
  const [toastMsg, setToastMsg] = useState("");

  // Modals state
  const [modalType, setModalType] = useState<
    "alert" | "listing" | "message" | null
  >(null);
  const [alertName, setAlertName] = useState("");
  const [alertPurpose, setAlertPurpose] = useState("Buy");
  const [alertType, setAlertType] = useState("Apartment");
  const [alertArea, setAlertArea] = useState("");
  const [listTitle, setListTitle] = useState("");
  const [listType, setListType] = useState("Apartment");
  const [listCity, setListCity] = useState("");
  const [listPrice, setListPrice] = useState("");
  const [listBeds, setListBeds] = useState("2");
  const [msgTopic, setMsgTopic] = useState("");
  const [msgText, setMsgText] = useState("");
  const [savedIds, setSavedIds] = useState<string[]>([]);

  const savedProperties = PROPERTIES.filter((p) => savedIds.includes(p.id));
  const activeThreadData = messages[activeThread] || messages[0];

  const viewTitles: Record<string, string> = {
    overview: "Home base",
    saved: "Saved spaces",
    alerts: "Match alerts",
    messages: "Conversations",
    sell: "Sell a property",
    settings: "Account studio",
  };

  useEffect(() => {
    const loadProfile = async () => {
      const supabase = createClient();

      // 1. Get authenticated user from Supabase
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        // 2. Fetch their profile row from the profiles table
        const { data: profile } = await supabase
          .from("profiles")
          .select(
            "full_name, phone, agency_name, bio, verification_status, logo_url",
          )
          .eq("id", user.id)
          .single();

        const fullName =
          profile?.full_name ||
          user.user_metadata?.full_name ||
          user.email?.split("@")[0] ||
          "";
        const phone = profile?.phone || user.user_metadata?.phone || "";
        const email = user.email || "";

        // 3. Update all display state
        setUserName(fullName);
        setNameInput(fullName);
        setUserEmail(email);
        setEmailInput(email);
        setPhoneInput(phone);
        // Location isn't in your DB schema yet — use cache or default
        setLocationInput("");

        // 4. Avatar from cache (stored as base64 locally)
        const cached = getCachedUser();
        if (cached?.avatar?.startsWith("data:image")) {
          setUserAvatar(cached.avatar);
          setAvatarInput(cached.avatar);
        }

        // 5. Keep cache in sync
        setCachedUser({
          name: fullName,
          email,
          role: profile?.verification_status || cached?.role || "buyer",
          avatar: cached?.avatar || "",
          location: cached?.location || "",
        });
      }

      setProfileLoading(false);
      setSavedIds(getSavedPropertyIds());
    };

    loadProfile();

    window.addEventListener(AUTH_CHANGE_EVENT, loadProfile);
    window.addEventListener(SAVED_CHANGE_EVENT, () =>
      setSavedIds(getSavedPropertyIds()),
    );

    return () => {
      window.removeEventListener(AUTH_CHANGE_EVENT, loadProfile);
      window.removeEventListener(SAVED_CHANGE_EVENT, () =>
        setSavedIds(getSavedPropertyIds()),
      );
    };
  }, []);

  const showToast = (text: string) => {
    setToastMsg(text);
    setTimeout(() => setToastMsg(""), 2500);
  };

  const switchView = (view: string) => {
    router.push(`/user-dashboard?view=${view}`);
  };

  const removeSaved = (id: string) => {
    toggleSavedPropertyId(id);
    showToast("Removed from saved spaces.");
  };

  const removeAlert = (idx: number) => {
    setAlerts((prev) => prev.filter((_, i) => i !== idx));
    showToast("Alert removed.");
  };

  const removeListing = (idx: number) => {
    setListings((prev) => prev.filter((_, i) => i !== idx));
    showToast("Listing deleted.");
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyText.trim()) return;
    const updated = [...messages];
    if (updated[activeThread]) {
      updated[activeThread].messages.push(["you", replyText.trim()]);
      setMessages(updated);
      setReplyText("");
      showToast("Message sent.");
    }
  };

  const handleSaveName = async () => {
    if (!nameInput.trim()) return;

    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      showToast("Not logged in.");
      return;
    }

    const { error } = await supabase
      .from("profiles")
      .update({
        full_name: nameInput.trim(),
        phone: phoneInput,
        updated_at: new Date().toISOString(),
      })
      .eq("id", user.id);

    if (error) {
      showToast("Failed to save: " + error.message);
      return;
    }

    setUserName(nameInput.trim());
    setUserEmail(emailInput);
    if (avatarInput) setUserAvatar(avatarInput);

    setCachedUser({
      name: nameInput.trim(),
      email: emailInput,
      role: getCachedUser()?.role || "buyer",
      avatar: avatarInput,
    });

    showToast("Profile updated successfully.");
  };

  const handleAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      if (ev.target?.result) {
        setAvatarInput(ev.target.result as string);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleCreateAlert = (e: React.FormEvent) => {
    e.preventDefault();
    setAlerts([
      {
        name: alertName,
        detail: `${alertPurpose} · ${alertType} · ${alertArea}`,
        on: true,
      },
      ...alerts,
    ]);
    setModalType(null);
    setAlertName("");
    setAlertArea("");
    showToast("Your match alert is active.");
  };

  const handleCreateListing = (e: React.FormEvent) => {
    e.preventDefault();
    setListings([
      {
        title: listTitle,
        type: listType,
        city: listCity,
        price: listPrice,
        beds: listBeds,
        status: "Draft",
      },
      ...listings,
    ]);
    setModalType(null);
    setListTitle("");
    setListCity("");
    setListPrice("");
    showToast("Property saved as a draft.");
  };

  const handleCreateMessage = (e: React.FormEvent) => {
    e.preventDefault();
    setMessages([
      {
        name: "PropertiesNexus Advisor",
        topic: msgTopic,
        messages: [["you", msgText]],
      },
      ...messages,
    ]);
    setModalType(null);
    setMsgTopic("");
    setMsgText("");
    setActiveThread(0);
    showToast("Your enquiry has been sent.");
  };

  return (
    <div className="flex flex-col min-h-screen bg-paper font-sans">
      {/* Top Header Bar */}
      <header className="h-[74px] max-md:h-[63px] bg-white border-b border-line flex items-center px-[clamp(20px,4vw,52px)] max-md:px-[16px] gap-[20px]">
        <span className="text-[12px] text-[#74828d] max-sm:hidden">
          My account / {viewTitles[currentView] || "Home base"}
        </span>
        <nav className="flex gap-[22px] ml-[24px] text-[12px] font-bold text-[#546471] max-md:hidden">
          <Link href="/properties">Properties</Link>
          <Link href="/#areas">Locations</Link>
        </nav>
        <div className="ml-auto flex items-center gap-[11px]">
          <button
            onClick={() => showToast("You have 3 new updates.")}
            className="h-[34px] w-[34px] rounded-full border border-line bg-white text-[#50606d] cursor-pointer flex items-center justify-center font-bold"
            title="Notifications"
          >
            🔔
          </button>
          <button
            onClick={() => switchView("settings")}
            className="border border-line bg-white rounded-[21px] p-[5px_10px_5px_5px] flex items-center gap-[7px] text-[11px] font-bold cursor-pointer hover:bg-gray-50 transition-colors"
          >
            {userAvatar ? (
              <img
                src={userAvatar}
                alt="Profile"
                className="h-[27px] w-[27px] rounded-full object-cover"
              />
            ) : (
              <span className="h-[27px] w-[27px] rounded-full bg-gradient-to-br from-[#d7a343] to-[#a76b1d] text-white flex items-center justify-center font-serif text-[13px]">
                {userName.charAt(0)}
              </span>
            )}
            <span className="max-sm:hidden">{userName.split(" ")[0]}</span>
          </button>
        </div>
      </header>

      {/* Main Container */}
      <div className="max-w-[1280px] w-full p-[37px_clamp(20px,4vw,52px)_70px] max-md:p-[25px_16px_55px] mx-auto flex-1">
        {/* OVERVIEW VIEW */}
        {currentView === "overview" && (
          <div>
            {/* At a glance — summary cards */}
            <div className="flex justify-between items-end mb-[14px]">
              <div>
                <p className="m-0 mb-[5px] text-[#a4681c] text-[10px] font-bold tracking-[1.5px] uppercase">
                  Account overview
                </p>
                <h2 className="font-serif text-[28px] font-medium tracking-[-1px] m-0">
                  At a glance
                </h2>
              </div>
              <span className="text-[11px] text-[#798791]">
                Your private account summary
              </span>
            </div>
            <div className="grid grid-cols-4 max-md:grid-cols-2 gap-[14px] max-sm:gap-[9px] mb-[25px]">
              <article className="bg-white border border-line min-h-[146px] p-[17px] max-sm:min-h-[130px] max-sm:p-[13px]">
                <span className="h-[31px] w-[31px] grid place-items-center rounded-full bg-[#eaf1ff] text-[#2c68d9] text-[14px]">
                  ◷
                </span>
                <p className="text-[11px] text-[#71808a] mt-[14px] mb-[5px]">
                  Property sessions
                </p>
                <b className="block font-serif text-[25px] font-medium text-ink">
                  1
                </b>
                <small className="block mt-[4px] text-[#85929a] text-[10px]">
                  Current signed-in session
                </small>
              </article>
              <article className="bg-white border border-line min-h-[146px] p-[17px] max-sm:min-h-[130px] max-sm:p-[13px]">
                <span className="h-[31px] w-[31px] grid place-items-center rounded-full bg-[#f1f2f0] text-[#68757e] text-[14px]">
                  ◌
                </span>
                <p className="text-[11px] text-[#71808a] mt-[14px] mb-[5px]">
                  Member since
                </p>
                <b className="block font-serif text-[20px] font-medium text-ink">
                  {new Date().toLocaleString("en-IN", {
                    month: "long",
                    year: "numeric",
                  })}
                </b>
                <small className="block mt-[4px] text-[#85929a] text-[10px]">
                  PropertiesNexus account
                </small>
              </article>
              <article className="bg-white border border-line min-h-[146px] p-[17px] max-sm:min-h-[130px] max-sm:p-[13px]">
                <span className="h-[31px] w-[31px] grid place-items-center rounded-full bg-[#e2faed] text-[#078b58] text-[14px]">
                  ✓
                </span>
                <p className="text-[11px] text-[#71808a] mt-[14px] mb-[5px]">
                  Account status
                </p>
                <b className="block font-serif text-[25px] font-medium text-ink">
                  Active
                </b>
                <small className="block mt-[4px] text-[#85929a] text-[10px]">
                  Verified account
                </small>
              </article>
              <article className="bg-white border border-line min-h-[146px] p-[17px] max-sm:min-h-[130px] max-sm:p-[13px]">
                <span className="h-[31px] w-[31px] grid place-items-center rounded-full bg-[#fff2df] text-[#aa701d] text-[14px]">
                  ▦
                </span>
                <p className="text-[11px] text-[#71808a] mt-[14px] mb-[5px]">
                  Properties listed
                </p>
                <b className="block font-serif text-[25px] font-medium text-ink">
                  {listings.length}
                </b>
                <small className="block mt-[4px] text-[#85929a] text-[10px]">
                  {listings.length
                    ? `${listings.filter((l) => l.status === "Live").length} live · ${listings.filter((l) => l.status !== "Live").length} draft`
                    : "No active listings"}
                </small>
              </article>
            </div>

            <div className="bg-gradient-to-r from-[#f8ecda] via-[#fff8ed] to-[#ecf2f1] p-[28px_30px] max-sm:p-[23px] border border-[#eadbc5] rounded relative overflow-hidden">
              <p className="text-[10px] uppercase tracking-[1.5px] font-bold text-[#a4681c] m-0 mb-[12px]">
                Your next address, considered
              </p>
              <h1 className="font-serif text-[37px] max-sm:text-[31px] font-medium tracking-[-1.6px] m-0 text-ink">
                Welcome back, {userName.split(" ")[0]}.
              </h1>
              <p className="text-[13px] text-[#596a75] max-w-[500px] leading-[1.65] my-[10px] mb-[20px]">
                Keep your saved homes, property conversations and selling plans
                together in one thoughtful place.
              </p>
              <button
                onClick={() => switchView("saved")}
                className="border-0 rounded-[7px] bg-navy hover:bg-navy2 !text-white p-[11px_14px] text-[12px] font-bold cursor-pointer transition-colors"
              >
                Continue your search
              </button>
            </div>

            <div className="flex items-end justify-between my-[30px] mb-[15px]">
              <div>
                <h1 className="font-serif text-[34px] max-sm:text-[28px] font-medium tracking-[-1.6px] m-0 text-ink">
                  Your journey today
                </h1>
                <p className="text-[12px] text-muted mt-[7px] mb-0">
                  Small steps that make the next move simpler.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-3 max-md:grid-cols-2 max-sm:grid-cols-1 gap-[14px]">
              <article className="bg-white border border-line p-[17px] min-h-[125px] rounded flex flex-col justify-between">
                <span className="h-[30px] w-[30px] rounded-full bg-[#edf3f2] text-[#477366] flex items-center justify-center text-[14px] font-bold">
                  ♥
                </span>
                <div>
                  <b className="block font-serif text-[25px] font-medium my-[13px] mb-[2px] text-ink">
                    {savedIds.length}
                  </b>
                  <span className="text-[10px] text-[#73818c]">
                    Saved spaces
                  </span>
                </div>
              </article>
              <article className="bg-white border border-line p-[17px] min-h-[125px] rounded flex flex-col justify-between">
                <span className="h-[30px] w-[30px] rounded-full bg-[#edf3f2] text-[#477366] flex items-center justify-center text-[14px] font-bold">
                  💬
                </span>
                <div>
                  <b className="block font-serif text-[25px] font-medium my-[13px] mb-[2px] text-ink">
                    {messages.length}
                  </b>
                  <span className="text-[10px] text-[#73818c]">
                    Open conversations
                  </span>
                </div>
              </article>
              <article className="bg-white border border-line p-[17px] min-h-[125px] rounded flex flex-col justify-between max-md:col-span-2 max-sm:col-span-1">
                <span className="h-[30px] w-[30px] rounded-full bg-[#edf3f2] text-[#477366] flex items-center justify-center text-[14px] font-bold">
                  🔍
                </span>
                <div>
                  <b className="block font-serif text-[25px] font-medium my-[13px] mb-[2px] text-ink">
                    {alerts.filter((a) => a.on).length}
                  </b>
                  <span className="text-[10px] text-[#73818c]">
                    Active match alerts
                  </span>
                </div>
              </article>
            </div>

            <div className="grid grid-cols-[1.2fr_0.8fr] max-lg:grid-cols-1 gap-[15px] mt-[15px]">
              <section className="bg-white border border-line p-[20px] rounded">
                <div className="flex justify-between items-center mb-[16px]">
                  <h2 className="text-[15px] m-0 font-bold text-ink">
                    Move forward with confidence
                  </h2>
                  <button
                    onClick={() => switchView("alerts")}
                    className="text-[#a36a1c] text-[11px] font-bold border-0 bg-transparent cursor-pointer hover:underline"
                  >
                    Manage alerts →
                  </button>
                </div>
                <div className="grid">
                  <div className="grid grid-cols-[30px_1fr_auto] gap-[10px] items-center py-[13px]">
                    <span className="h-[25px] w-[25px] rounded-full bg-[#f2f4f3] text-[#5c6e75] flex items-center justify-center text-[10px] font-bold">
                      01
                    </span>
                    <div>
                      <b className="text-[12px] font-bold text-ink">
                        Refine your saved areas
                      </b>
                      <p className="text-[10px] text-[#788691] m-0 mt-[3px]">
                        Set a match alert and get notified when something
                        relevant appears.
                      </p>
                    </div>
                    <button
                      onClick={() => switchView("alerts")}
                      className="border-0 bg-transparent text-[#a36a1c] text-[11px] font-bold cursor-pointer hover:underline"
                    >
                      Set alert
                    </button>
                  </div>
                  <div className="grid grid-cols-[30px_1fr_auto] gap-[10px] items-center py-[13px] border-t border-[#edf0f1]">
                    <span className="h-[25px] w-[25px] rounded-full bg-[#f2f4f3] text-[#5c6e75] flex items-center justify-center text-[10px] font-bold">
                      02
                    </span>
                    <div>
                      <b className="text-[12px] font-bold text-ink">
                        Arrange a private viewing
                      </b>
                      <p className="text-[10px] text-[#788691] m-0 mt-[3px]">
                        Choose a saved property and send your request to an
                        advisor.
                      </p>
                    </div>
                    <button
                      onClick={() => switchView("saved")}
                      className="border-0 bg-transparent text-[#a36a1c] text-[11px] font-bold cursor-pointer hover:underline"
                    >
                      View homes
                    </button>
                  </div>
                  <div className="grid grid-cols-[30px_1fr_auto] gap-[10px] items-center py-[13px] border-t border-[#edf0f1]">
                    <span className="h-[25px] w-[25px] rounded-full bg-[#f2f4f3] text-[#5c6e75] flex items-center justify-center text-[10px] font-bold">
                      03
                    </span>
                    <div>
                      <b className="text-[12px] font-bold text-ink">
                        Prepare to sell
                      </b>
                      <p className="text-[10px] text-[#788691] m-0 mt-[3px]">
                        Start a draft listing when you are ready to reach
                        buyers.
                      </p>
                    </div>
                    <button
                      onClick={() => switchView("sell")}
                      className="border-0 bg-transparent text-[#a36a1c] text-[11px] font-bold cursor-pointer hover:underline"
                    >
                      Add property
                    </button>
                  </div>
                </div>
              </section>

              <section className="bg-white border border-line p-[20px] rounded">
                <div className="flex justify-between items-center mb-[16px]">
                  <h2 className="text-[15px] m-0 font-bold text-ink">
                    Latest activity
                  </h2>
                </div>
                <div className="grid gap-[15px]">
                  <div className="pl-[18px] text-[12px] leading-[1.45] text-ink relative">
                    <span className="absolute left-0 top-[5px] h-[8px] w-[8px] rounded-full bg-gold" />
                    A new listing aligns with your Mumbai alert.
                    <small className="block text-[10px] text-[#87949c] mt-[3px]">
                      Today
                    </small>
                  </div>
                  <div className="pl-[18px] text-[12px] leading-[1.45] text-ink relative">
                    <span className="absolute left-0 top-[5px] h-[8px] w-[8px] rounded-full bg-gold" />
                    Your viewing enquiry was received by the property advisor.
                    <small className="block text-[10px] text-[#87949c] mt-[3px]">
                      Yesterday
                    </small>
                  </div>
                  <div className="pl-[18px] text-[12px] leading-[1.45] text-ink relative">
                    <span className="absolute left-0 top-[5px] h-[8px] w-[8px] rounded-full bg-gold" />
                    A saved villa in Goa has a new price.
                    <small className="block text-[10px] text-[#87949c] mt-[3px]">
                      3 days ago
                    </small>
                  </div>
                </div>
              </section>
            </div>
          </div>
        )}

        {/* SAVED SPACES VIEW */}
        {currentView === "saved" && (
          <div>
            <div className="flex items-end justify-between my-[30px] mb-[15px]">
              <div>
                <h1 className="font-serif text-[34px] max-sm:text-[28px] font-medium tracking-[-1.6px] m-0 text-ink">
                  Saved spaces
                </h1>
                <p className="text-[12px] text-muted mt-[7px] mb-0">
                  Keep the homes you want to revisit close at hand.
                </p>
              </div>
              <Link
                href="/properties"
                className="border-0 rounded-[7px] bg-navy !text-white p-[11px_14px] text-[12px] font-bold hover:bg-navy2 transition-colors"
              >
                Browse properties
              </Link>
            </div>

            <div className="grid gap-[10px]">
              {savedProperties.length > 0 ? (
                savedProperties.map((p) => (
                  <article
                    key={p.id}
                    className="grid grid-cols-[95px_1fr_auto] max-sm:grid-cols-[72px_1fr] gap-[13px] items-center border border-[#e3e8e9] p-[10px] rounded bg-white relative"
                  >
                    <Link
                      href={`/properties/${p.id}`}
                      className="h-[66px] w-[95px] max-sm:h-[57px] max-sm:w-[72px] bg-cover bg-center rounded block shrink-0"
                      style={{ backgroundImage: `url('${p.image}')` }}
                    />
                    <div className="min-w-0 max-sm:col-start-2">
                      <Link
                        href={`/properties/${p.id}`}
                        className="hover:text-gold transition-colors block"
                      >
                        <h3 className="text-[13px] font-bold m-0 mb-[4px] text-ink truncate">
                          {p.title}
                        </h3>
                      </Link>
                      <p className="m-0 text-[10px] text-muted truncate">
                        {p.area}, {p.city} · {p.beds || "—"} Bed · {p.areaSq}
                      </p>
                      <b className="text-[12px] font-bold block my-[7px] text-ink">
                        {p.displayPrice}
                      </b>
                    </div>
                    <button
                      onClick={() => removeSaved(p.id)}
                      title="Remove"
                      className="border-0 bg-white text-[#9aa5ab] text-[20px] font-bold cursor-pointer hover:text-red transition-colors max-sm:absolute max-sm:right-[9px] max-sm:top-[9px]"
                    >
                      ×
                    </button>
                  </article>
                ))
              ) : (
                <div className="border border-dashed border-[#bdc8cc] p-[38px] text-center text-[12px] text-muted rounded bg-white">
                  No saved spaces yet.
                  <br />
                  <br />
                  <Link
                    href="/properties"
                    className="inline-block bg-navy !text-white font-bold px-4 py-2 rounded"
                  >
                    Explore properties
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ALERTS VIEW */}
        {currentView === "alerts" && (
          <div>
            <div className="flex items-end justify-between my-[30px] mb-[15px]">
              <div>
                <h1 className="font-serif text-[34px] max-sm:text-[28px] font-medium tracking-[-1.6px] m-0 text-ink">
                  Match alerts
                </h1>
                <p className="text-[12px] text-muted mt-[7px] mb-0">
                  We will keep watch for the kinds of properties you care about.
                </p>
              </div>
              <button
                onClick={() => setModalType("alert")}
                className="border-0 rounded-[7px] bg-navy !text-white p-[11px_14px] text-[12px] font-bold cursor-pointer hover:bg-navy2 transition-colors"
              >
                + Create alert
              </button>
            </div>

            <div className="grid gap-[10px]">
              {alerts.length > 0 ? (
                alerts.map((a, i) => (
                  <article
                    key={i}
                    className="border border-line bg-white p-[17px] rounded flex justify-between items-center gap-[8px]"
                  >
                    <div>
                      <h3 className="text-[13px] font-bold m-0 mb-[5px] text-ink">
                        {a.name}
                      </h3>
                      <p className="text-[11px] text-muted m-0">{a.detail}</p>
                    </div>
                    <div className="flex items-center gap-[10px]">
                      <span className="text-[9px] font-bold p-[5px_7px] rounded-[12px] bg-[#edf7f1] text-green">
                        {a.on ? "Watching" : "Paused"}
                      </span>
                      <button
                        onClick={() => removeAlert(i)}
                        className="border-0 bg-white text-[#9aa5ab] text-[20px] font-bold cursor-pointer hover:text-red transition-colors"
                      >
                        ×
                      </button>
                    </div>
                  </article>
                ))
              ) : (
                <div className="border border-dashed border-[#bdc8cc] p-[38px] text-center text-[12px] text-muted rounded bg-white">
                  No match alerts yet.
                  <br />
                  <br />
                  <button
                    onClick={() => setModalType("alert")}
                    className="bg-navy !text-white font-bold px-4 py-2 rounded border-0 cursor-pointer"
                  >
                    Create your first alert
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* MESSAGES VIEW */}
        {currentView === "messages" && (
          <div>
            <div className="flex items-end justify-between my-[30px] mb-[15px]">
              <div>
                <h1 className="font-serif text-[34px] max-sm:text-[28px] font-medium tracking-[-1.6px] m-0 text-ink">
                  Conversations
                </h1>
                <p className="text-[12px] text-muted mt-[7px] mb-0">
                  Keep enquiries and property discussions organised.
                </p>
              </div>
              <button
                onClick={() => setModalType("message")}
                className="border border-[#b6c1c6] rounded-[7px] bg-white text-[#324453] p-[10px_13px] text-[12px] font-bold cursor-pointer hover:bg-gray-50 transition-colors"
              >
                New conversation
              </button>
            </div>

            <div className="grid grid-cols-[245px_1fr] max-md:grid-cols-1 border border-line bg-white min-h-[390px] rounded">
              <aside className="border-r max-md:border-r-0 max-md:border-b border-line max-md:flex max-md:overflow-x-auto">
                {messages.map((t, i) => (
                  <button
                    key={i}
                    onClick={() => setActiveThread(i)}
                    className={`w-full max-md:min-w-[160px] max-md:w-auto border-0 border-b border-[#edf0f1] text-left p-[14px] cursor-pointer transition-colors ${
                      i === activeThread
                        ? "bg-[#f2f5f4] border-l-4 border-l-gold max-md:border-l-0 max-md:border-b-4 max-md:border-b-gold"
                        : "bg-white hover:bg-gray-50"
                    }`}
                  >
                    <b className="text-[12px] font-bold text-ink block">
                      {t.name}
                    </b>
                    <span className="text-[10px] text-[#75838d] block mt-[4px] truncate">
                      {t.topic}
                    </span>
                  </button>
                ))}
              </aside>

              <section className="p-[20px] flex flex-col justify-between max-sm:min-h-[285px]">
                <div>
                  <h2 className="text-[14px] font-bold m-0 text-ink">
                    {activeThreadData.name}
                  </h2>
                  <p className="text-[11px] text-muted my-[4px] mb-[22px]">
                    Regarding: {activeThreadData.topic}
                  </p>
                  <div className="flex flex-col gap-[12px] mb-[20px]">
                    {activeThreadData.messages.map((m, idx) => (
                      <div
                        key={idx}
                        className={`p-[10px_12px] text-[12px] leading-[1.45] max-w-[75%] ${
                          m[0] === "you"
                            ? "bg-[#143957] text-white rounded-[12px_3px_12px_12px] ml-auto"
                            : "bg-[#f2f4f3] text-ink rounded-[3px_12px_12px_12px]"
                        }`}
                      >
                        {m[1]}
                      </div>
                    ))}
                  </div>
                </div>

                <form
                  onSubmit={handleSendMessage}
                  className="flex gap-[8px] mt-auto pt-4 border-t border-line"
                >
                  <input
                    type="text"
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    placeholder="Write a message"
                    className="flex-1 border border-line p-[10px] rounded-[7px] text-[12px] outline-0 bg-white text-ink"
                  />
                  <button
                    type="submit"
                    className="border-0 bg-navy hover:bg-navy2 !text-white rounded-[7px] px-[14px] text-[12px] font-bold cursor-pointer transition-colors"
                  >
                    Send
                  </button>
                </form>
              </section>
            </div>
          </div>
        )}

        {/* SELL VIEW */}
        {currentView === "sell" && (
          <div>
            <div className="flex items-end justify-between my-[30px] mb-[15px]">
              <div>
                <h1 className="font-serif text-[34px] max-sm:text-[28px] font-medium tracking-[-1.6px] m-0 text-ink">
                  Sell a property
                </h1>
                <p className="text-[12px] text-muted mt-[7px] mb-0">
                  Build your listing at your pace, then bring it to the right
                  audience.
                </p>
              </div>
              <button
                onClick={() => setModalType("listing")}
                className="border-0 rounded-[7px] bg-navy !text-white p-[11px_14px] text-[12px] font-bold cursor-pointer hover:bg-navy2 transition-colors"
              >
                + Add property
              </button>
            </div>

            <div className="grid grid-cols-3 max-md:grid-cols-2 max-sm:grid-cols-1 gap-[14px]">
              {listings.length > 0 ? (
                listings.map((item, idx) => (
                  <article
                    key={idx}
                    className="bg-white border border-line rounded overflow-hidden flex flex-col"
                  >
                    <div
                      className="h-[150px] bg-cover bg-center"
                      style={{
                        backgroundImage: `url('${
                          idx % 2
                            ? "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=750&q=80"
                            : "https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?auto=format&fit=crop&w=750&q=80"
                        }')`,
                      }}
                    />
                    <div className="p-[14px] flex flex-col flex-1">
                      <span
                        className={`text-[9px] font-bold p-[5px_7px] rounded-[12px] w-max uppercase ${
                          item.status === "Draft"
                            ? "bg-[#fff5df] text-[#a16d14]"
                            : "bg-[#eaf7ef] text-green"
                        }`}
                      >
                        {item.status}
                      </span>
                      <h3 className="text-[13px] font-bold my-[9px] mb-[4px] text-ink">
                        {item.title}
                      </h3>
                      <p className="text-[10px] text-muted m-0 mb-[10px]">
                        {item.type} · {item.city} · {item.beds} Bed
                      </p>
                      <b className="text-[12px] font-bold text-ink mt-auto">
                        {item.price}
                      </b>
                      <div className="flex gap-[8px] mt-[13px] pt-[10px] border-t border-line">
                        <button
                          onClick={() =>
                            showToast(
                              "The full listing editor will be connected to secure property management.",
                            )
                          }
                          className="border border-line bg-white p-[7px_9px] text-[10px] font-bold cursor-pointer rounded hover:bg-gray-50 flex-1"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => removeListing(idx)}
                          className="border border-line bg-white text-red p-[7px_9px] text-[10px] font-bold cursor-pointer rounded hover:bg-red/10"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </article>
                ))
              ) : (
                <div className="col-span-full border border-dashed border-[#bdc8cc] p-[38px] text-center text-[12px] text-muted rounded bg-white">
                  No property drafts or live listings yet.
                  <br />
                  <br />
                  <button
                    onClick={() => setModalType("listing")}
                    className="bg-navy !text-white font-bold px-4 py-2 rounded border-0 cursor-pointer"
                  >
                    Add your first property
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* SETTINGS VIEW */}
        {currentView === "settings" && (
          <div>
            <div className="flex items-end justify-between my-[30px] mb-[15px]">
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
              <section className="border border-line bg-white p-[22px] rounded">
                <h2 className="text-[15px] font-bold m-0 mb-[5px] text-ink">
                  Profile
                </h2>
                <p className="text-[11px] text-muted m-0 mb-[16px]">
                  Your visible account details.
                </p>
                <div className="grid grid-cols-[auto_1fr] max-sm:grid-cols-1 gap-[15px] items-start">
                  <div className="flex flex-col gap-[7px]">
                    <span className="block text-[11px] font-bold text-ink">
                      Profile picture
                    </span>
                    <label className="cursor-pointer shrink-0 block relative group">
                      <div className="h-[70px] w-[70px] rounded-full bg-slate-100 border border-slate-200 overflow-hidden flex items-center justify-center relative shadow-sm">
                        {avatarInput ? (
                          <img
                            src={avatarInput}
                            alt="Avatar Preview"
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <span className="text-slate-400 text-3xl">👤</span>
                        )}
                        <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                          <span className="text-white text-xs font-bold">
                            Edit
                          </span>
                        </div>
                      </div>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleAvatarUpload}
                        className="hidden"
                      />
                    </label>
                  </div>
                  <div className="grid grid-cols-2 max-sm:grid-cols-1 gap-[12px]">
                    <label className="block">
                      <span className="block text-[11px] font-bold text-ink mb-[7px]">
                        Display name
                      </span>
                      <input
                        type="text"
                        value={nameInput}
                        onChange={(e) => setNameInput(e.target.value)}
                        className="border border-line rounded-[7px] w-full p-[10px] text-[12px] bg-white text-ink outline-0 focus:border-[#d49a38] transition-colors"
                      />
                    </label>
                    <label className="block">
                      <span className="block text-[11px] font-bold text-ink mb-[7px]">
                        Email address
                      </span>
                      <input
                        type="email"
                        value={emailInput}
                        onChange={(e) => setEmailInput(e.target.value)}
                        className="border border-line rounded-[7px] w-full p-[10px] text-[12px] bg-white text-ink outline-0 focus:border-[#d49a38] transition-colors"
                      />
                    </label>
                    <label className="block">
                      <span className="block text-[11px] font-bold text-ink mb-[7px]">
                        Phone number
                      </span>
                      <input
                        type="tel"
                        value={phoneInput}
                        onChange={(e) => setPhoneInput(e.target.value)}
                        className="border border-line rounded-[7px] w-full p-[10px] text-[12px] bg-white text-ink outline-0 focus:border-[#d49a38] transition-colors"
                      />
                    </label>
                    <label className="block">
                      <span className="block text-[11px] font-bold text-ink mb-[7px]">
                        Location
                      </span>
                      <input
                        type="text"
                        value={locationInput}
                        onChange={(e) => setLocationInput(e.target.value)}
                        className="border border-line rounded-[7px] w-full p-[10px] text-[12px] bg-white text-ink outline-0 focus:border-[#d49a38] transition-colors"
                      />
                    </label>
                    <div className="col-span-full mt-2">
                      <button
                        onClick={handleSaveName}
                        className="border-0 rounded-[7px] bg-navy !text-white p-[11px_24px] text-[12px] font-bold cursor-pointer hover:bg-navy2 transition-colors inline-block"
                      >
                        Save changes
                      </button>
                    </div>
                  </div>
                </div>
              </section>

              <section className="border border-line bg-white p-[22px] rounded">
                <h2 className="text-[15px] font-bold m-0 mb-[5px] text-ink">
                  Notifications
                </h2>
                <p className="text-[11px] text-muted m-0 mb-[16px]">
                  Choose the updates you would like to receive.
                </p>

                <div className="flex justify-between items-center py-[15px] border-b border-[#edf0f1]">
                  <div>
                    <b className="block text-[12px] font-bold text-ink">
                      Property matches
                    </b>
                    <p className="text-[10px] text-muted m-0 mt-[4px] max-w-[540px]">
                      Receive updates when a new property matches an active
                      alert.
                    </p>
                  </div>
                  <input
                    type="checkbox"
                    defaultChecked
                    onChange={() => showToast("Preference saved.")}
                    className="w-[38px] h-[22px] rounded-[15px] bg-[#bdc5c9] checked:bg-navy appearance-none relative cursor-pointer transition-colors after:content-[''] after:h-[16px] after:w-[16px] after:bg-white after:rounded-full after:absolute after:top-[3px] after:left-[3px] checked:after:left-[19px] after:transition-all"
                  />
                </div>

                <div className="flex justify-between items-center py-[15px] border-b border-[#edf0f1]">
                  <div>
                    <b className="block text-[12px] font-bold text-ink">
                      Saved property changes
                    </b>
                    <p className="text-[10px] text-muted m-0 mt-[4px] max-w-[540px]">
                      Get important availability and price updates for saved
                      homes.
                    </p>
                  </div>
                  <input
                    type="checkbox"
                    defaultChecked
                    onChange={() => showToast("Preference saved.")}
                    className="w-[38px] h-[22px] rounded-[15px] bg-[#bdc5c9] checked:bg-navy appearance-none relative cursor-pointer transition-colors after:content-[''] after:h-[16px] after:w-[16px] after:bg-white after:rounded-full after:absolute after:top-[3px] after:left-[3px] checked:after:left-[19px] after:transition-all"
                  />
                </div>

                <div className="flex justify-between items-center py-[15px]">
                  <div>
                    <b className="block text-[12px] font-bold text-ink">
                      PropertiesNexus weekly edit
                    </b>
                    <p className="text-[10px] text-muted m-0 mt-[4px] max-w-[540px]">
                      A concise roundup of noteworthy new addresses.
                    </p>
                  </div>
                  <input
                    type="checkbox"
                    onChange={() => showToast("Preference saved.")}
                    className="w-[38px] h-[22px] rounded-[15px] bg-[#bdc5c9] checked:bg-navy appearance-none relative cursor-pointer transition-colors after:content-[''] after:h-[16px] after:w-[16px] after:bg-white after:rounded-full after:absolute after:top-[3px] after:left-[3px] checked:after:left-[19px] after:transition-all"
                  />
                </div>
              </section>

              <section className="border border-line bg-white p-[22px] rounded">
                <h2 className="text-[15px] font-bold m-0 mb-[5px] text-ink">
                  Account safety
                </h2>
                <p className="text-[11px] text-muted m-0 mb-[16px]">
                  Your password and secure verification will be connected once
                  live account authentication is enabled.
                </p>
                <button
                  onClick={() =>
                    showToast(
                      "Security controls will be available with secure authentication.",
                    )
                  }
                  className="border border-[#b6c1c6] rounded-[7px] bg-white text-[#324453] p-[10px_13px] text-[12px] font-bold cursor-pointer hover:bg-gray-50 transition-colors"
                >
                  Review security options
                </button>
              </section>
            </div>
          </div>
        )}
      </div>

      {/* MODALS */}
      {modalType && (
        <div className="fixed inset-0 bg-[rgba(3,17,31,0.62)] z-50 flex items-center justify-center p-[20px] overflow-y-auto">
          <div className="bg-white max-w-[550px] w-full p-[26px] rounded-[10px] relative shadow-2xl my-auto">
            <button
              onClick={() => setModalType(null)}
              className="absolute right-[14px] top-[11px] border-0 bg-transparent text-[22px] text-[#697681] cursor-pointer font-bold"
            >
              ×
            </button>

            {modalType === "alert" && (
              <form onSubmit={handleCreateAlert}>
                <h2 className="font-serif text-xl font-bold m-0 mb-[7px] text-ink">
                  Create a match alert
                </h2>
                <p className="text-[11px] text-muted m-0 leading-[1.55]">
                  Tell us what you are looking for and we will keep watch.
                </p>
                <div className="grid grid-cols-2 max-sm:grid-cols-1 gap-[12px] my-[17px]">
                  <label className="col-span-full">
                    <span className="block text-[11px] font-bold text-ink mb-[6px]">
                      Alert name
                    </span>
                    <input
                      required
                      value={alertName}
                      onChange={(e) => setAlertName(e.target.value)}
                      placeholder="e.g. Homes in Bengaluru"
                      className="border border-line rounded-[7px] w-full p-[10px] text-[12px] bg-white text-ink outline-0"
                    />
                  </label>
                  <label>
                    <span className="block text-[11px] font-bold text-ink mb-[6px]">
                      Purpose
                    </span>
                    <select
                      value={alertPurpose}
                      onChange={(e) => setAlertPurpose(e.target.value)}
                      className="border border-line rounded-[7px] w-full p-[10px] text-[12px] bg-white text-ink outline-0"
                    >
                      <option>Buy</option>
                      <option>Rent</option>
                    </select>
                  </label>
                  <label>
                    <span className="block text-[11px] font-bold text-ink mb-[6px]">
                      Property type
                    </span>
                    <select
                      value={alertType}
                      onChange={(e) => setAlertType(e.target.value)}
                      className="border border-line rounded-[7px] w-full p-[10px] text-[12px] bg-white text-ink outline-0"
                    >
                      <option>Apartment</option>
                      <option>Villa</option>
                      <option>Any type</option>
                    </select>
                  </label>
                  <label className="col-span-full">
                    <span className="block text-[11px] font-bold text-ink mb-[6px]">
                      Location or area
                    </span>
                    <input
                      required
                      value={alertArea}
                      onChange={(e) => setAlertArea(e.target.value)}
                      placeholder="City or locality"
                      className="border border-line rounded-[7px] w-full p-[10px] text-[12px] bg-white text-ink outline-0"
                    />
                  </label>
                </div>
                <button
                  type="submit"
                  className="w-full bg-navy !text-white font-bold p-[11px] rounded-[7px] border-0 cursor-pointer"
                >
                  Save alert
                </button>
              </form>
            )}

            {modalType === "listing" && (
              <form onSubmit={handleCreateListing}>
                <h2 className="font-serif text-xl font-bold m-0 mb-[7px] text-ink">
                  Add a property
                </h2>
                <p className="text-[11px] text-muted m-0 leading-[1.55]">
                  Start your listing now. You can add photos and verification
                  details when publishing.
                </p>
                <div className="grid grid-cols-2 max-sm:grid-cols-1 gap-[12px] my-[17px]">
                  <label>
                    <span className="block text-[11px] font-bold text-ink mb-[6px]">
                      Property title
                    </span>
                    <input
                      required
                      value={listTitle}
                      onChange={(e) => setListTitle(e.target.value)}
                      placeholder="e.g. Garden View Apartment"
                      className="border border-line rounded-[7px] w-full p-[10px] text-[12px] bg-white text-ink outline-0"
                    />
                  </label>
                  <label>
                    <span className="block text-[11px] font-bold text-ink mb-[6px]">
                      Property type
                    </span>
                    <select
                      value={listType}
                      onChange={(e) => setListType(e.target.value)}
                      className="border border-line rounded-[7px] w-full p-[10px] text-[12px] bg-white text-ink outline-0"
                    >
                      <option>Apartment</option>
                      <option>Villa</option>
                      <option>Independent house</option>
                      <option>Plot</option>
                      <option>Office</option>
                    </select>
                  </label>
                  <label>
                    <span className="block text-[11px] font-bold text-ink mb-[6px]">
                      City
                    </span>
                    <input
                      required
                      value={listCity}
                      onChange={(e) => setListCity(e.target.value)}
                      placeholder="e.g. Mumbai"
                      className="border border-line rounded-[7px] w-full p-[10px] text-[12px] bg-white text-ink outline-0"
                    />
                  </label>
                  <label>
                    <span className="block text-[11px] font-bold text-ink mb-[6px]">
                      Asking price
                    </span>
                    <input
                      required
                      value={listPrice}
                      onChange={(e) => setListPrice(e.target.value)}
                      placeholder="e.g. ₹ 1.25 Cr"
                      className="border border-line rounded-[7px] w-full p-[10px] text-[12px] bg-white text-ink outline-0"
                    />
                  </label>
                  <label>
                    <span className="block text-[11px] font-bold text-ink mb-[6px]">
                      Bedrooms
                    </span>
                    <select
                      value={listBeds}
                      onChange={(e) => setListBeds(e.target.value)}
                      className="border border-line rounded-[7px] w-full p-[10px] text-[12px] bg-white text-ink outline-0"
                    >
                      <option>1</option>
                      <option>2</option>
                      <option>3</option>
                      <option>4</option>
                      <option>5+</option>
                    </select>
                  </label>
                  <label>
                    <span className="block text-[11px] font-bold text-ink mb-[6px]">
                      Contact number
                    </span>
                    <input
                      required
                      placeholder="+91 00000 00000"
                      className="border border-line rounded-[7px] w-full p-[10px] text-[12px] bg-white text-ink outline-0"
                    />
                  </label>
                </div>
                <button
                  type="submit"
                  className="w-full bg-navy !text-white font-bold p-[11px] rounded-[7px] border-0 cursor-pointer"
                >
                  Save as draft
                </button>
              </form>
            )}

            {modalType === "message" && (
              <form onSubmit={handleCreateMessage}>
                <h2 className="font-serif text-xl font-bold m-0 mb-[7px] text-ink">
                  Start a conversation
                </h2>
                <p className="text-[11px] text-muted m-0 leading-[1.55]">
                  Send an advisor a property enquiry.
                </p>
                <div className="grid gap-[12px] my-[17px]">
                  <label>
                    <span className="block text-[11px] font-bold text-ink mb-[6px]">
                      Property or topic
                    </span>
                    <input
                      required
                      value={msgTopic}
                      onChange={(e) => setMsgTopic(e.target.value)}
                      placeholder="What would you like to discuss?"
                      className="border border-line rounded-[7px] w-full p-[10px] text-[12px] bg-white text-ink outline-0"
                    />
                  </label>
                  <label>
                    <span className="block text-[11px] font-bold text-ink mb-[6px]">
                      Message
                    </span>
                    <textarea
                      required
                      rows={4}
                      value={msgText}
                      onChange={(e) => setMsgText(e.target.value)}
                      placeholder="Write your message"
                      className="border border-line rounded-[7px] w-full p-[10px] text-[12px] bg-white text-ink outline-0 resize-none"
                    />
                  </label>
                </div>
                <button
                  type="submit"
                  className="w-full bg-navy !text-white font-bold p-[11px] rounded-[7px] border-0 cursor-pointer"
                >
                  Send enquiry
                </button>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Toast Notice */}
      {toastMsg && (
        <div className="fixed bottom-[20px] right-[20px] bg-[#143b60] text-white p-[12px_15px] rounded-[7px] text-[12px] shadow-[0_8px_22px_rgba(0,0,0,0.2)] z-50 animate-bounce">
          {toastMsg}
        </div>
      )}
    </div>
  );
}

export default function UserDashboardPage() {
  return (
    <Suspense
      fallback={
        <div className="p-8 font-serif text-xl">
          Loading Account Home Base...
        </div>
      }
    >
      <UserDashboardContent />
    </Suspense>
  );
}
