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

  const [userName, setUserName] = useState("Aarav Shah");
  const [userEmail, setUserEmail] = useState("aarav@example.com");
  const [nameInput, setNameInput] = useState("Aarav Shah");
  const [emailInput, setEmailInput] = useState("aarav@example.com");
  const [phoneInput, setPhoneInput] = useState("+91 98765 43210");
  const [locationInput, setLocationInput] = useState("Mumbai, India");
  const [userAvatar, setUserAvatar] = useState("");
  const [avatarInput, setAvatarInput] = useState("");
  const [savedIds, setSavedIds] = useState<string[]>([]);

  useEffect(() => {
    const loadState = () => {
      const u = getCachedUser();
      if (u) {
        setUserName(u.name);
        setNameInput(u.name);
        if (u.email) setUserEmail(u.email);
        if (u.avatar && u.avatar.startsWith("data:image")) {
          setUserAvatar(u.avatar);
          setAvatarInput(u.avatar);
        }
      }
      setSavedIds(getSavedPropertyIds());
    };
    loadState();
    window.addEventListener(AUTH_CHANGE_EVENT, loadState);
    window.addEventListener(SAVED_CHANGE_EVENT, loadState);
    return () => {
      window.removeEventListener(AUTH_CHANGE_EVENT, loadState);
      window.removeEventListener(SAVED_CHANGE_EVENT, loadState);
    };
  }, []);
  const [alerts, setAlerts] = useState<AlertItem[]>([
    { name: "3-bedroom homes in Mumbai", detail: "Buy · Apartment or villa · ₹ 2 Cr to ₹ 10 Cr", on: true },
    { name: "Villas in Goa", detail: "Rent · 3+ bedrooms · Any budget", on: true },
  ]);
  const [listings, setListings] = useState<ListingItem[]>([
    { title: "Bandra Atelier", type: "Apartment", city: "Mumbai", price: "₹ 98k / mo", beds: "2", status: "Live" },
  ]);
  const [messages, setMessages] = useState<MessageThread[]>([
    {
      name: "Maya · Property advisor",
      topic: "Skyline Residences",
      messages: [
        ["advisor", "Hello Aarav, I can help arrange a viewing for Skyline Residences."],
        ["you", "Thank you. I would like to see it this weekend."],
      ],
    },
  ]);
  const [activeThread, setActiveThread] = useState(0);
  const [replyText, setReplyText] = useState("");
  const [toastMsg, setToastMsg] = useState("");

  // Modals state
  const [modalType, setModalType] = useState<"alert" | "listing" | "message" | null>(null);
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

  const handleSaveName = () => {
    if (nameInput.trim()) {
      const updatedName = nameInput.trim();
      setUserName(updatedName);
      setUserEmail(emailInput);
      if (avatarInput) setUserAvatar(avatarInput);
      setCachedUser({
        name: updatedName,
        email: emailInput,
        role: getCachedUser()?.role || "buyer",
        avatar: avatarInput,
        // In a real app we'd save phone and location here too
      });
      showToast("Profile updated successfully.");
    }
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
      { name: alertName, detail: `${alertPurpose} · ${alertType} · ${alertArea}`, on: true },
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
      { title: listTitle, type: listType, city: listCity, price: listPrice, beds: listBeds, status: "Draft" },
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
      { name: "PropertiesNexus Advisor", topic: msgTopic, messages: [["you", msgText]] },
      ...messages,
    ]);
    setModalType(null);
    setMsgTopic("");
    setMsgText("");
    setActiveThread(0);
    showToast("Your enquiry has been sent.");
  };

  const savedProperties = PROPERTIES.filter((p) => savedIds.includes(p.id));
  const activeThreadData = messages[activeThread] || messages[0];

  const viewTitles: Record<string, string> = {
    overview: "Home base",
    saved: "Saved spaces",
    alerts: "Match alerts",
    messages: "My Enquiries",
    sell: "Sell a property",
    enquiries: "My Enquiries",
    settings: "Account studio",
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
          <button onClick={() => switchView("enquiries")} className="border-0 bg-transparent text-[#546471] font-bold text-[12px] cursor-pointer hover:text-ink">My Enquiries</button>
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
              <img src={userAvatar} alt="Profile" className="h-[27px] w-[27px] rounded-full object-cover" />
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
            <div className="bg-gradient-to-r from-[#f8ecda] via-[#fff8ed] to-[#ecf2f1] p-[28px_30px] max-sm:p-[23px] border border-[#eadbc5] rounded relative overflow-hidden">
              <p className="text-[10px] uppercase tracking-[1.5px] font-bold text-[#a4681c] m-0 mb-[12px]">
                Your next address, considered
              </p>
              <h1 className="font-serif text-[37px] max-sm:text-[31px] font-medium tracking-[-1.6px] m-0 text-ink">
                Welcome back, {userName.split(" ")[0]}.
              </h1>
              <p className="text-[13px] text-[#596a75] max-w-[500px] leading-[1.65] my-[10px] mb-[20px]">
                Keep your saved homes, property conversations and selling plans together in one thoughtful place.
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
                  <span className="text-[10px] text-[#73818c]">Saved spaces</span>
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
                  <span className="text-[10px] text-[#73818c]">Open conversations</span>
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
                  <span className="text-[10px] text-[#73818c]">Active match alerts</span>
                </div>
              </article>
            </div>

            <div className="grid grid-cols-[1.2fr_0.8fr] max-lg:grid-cols-1 gap-[15px] mt-[15px]">
              <section className="bg-white border border-line p-[20px] rounded">
                <div className="flex justify-between items-center mb-[16px]">
                  <h2 className="text-[15px] m-0 font-bold text-ink">Next best actions</h2>
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
                      <b className="text-[12px] font-bold text-ink">Refine your saved areas</b>
                      <p className="text-[10px] text-[#788691] m-0 mt-[3px]">
                        Set a match alert and get notified when something relevant appears.
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
                      <b className="text-[12px] font-bold text-ink">Arrange a private viewing</b>
                      <p className="text-[10px] text-[#788691] m-0 mt-[3px]">
                        Choose a saved property and send your request to an advisor.
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
                      <b className="text-[12px] font-bold text-ink">Prepare to sell</b>
                      <p className="text-[10px] text-[#788691] m-0 mt-[3px]">
                        Start a draft listing when you are ready to reach buyers.
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
                  <h2 className="text-[15px] m-0 font-bold text-ink">Latest activity</h2>
                </div>
                <div className="grid gap-[15px]">
                  <div className="pl-[18px] text-[12px] leading-[1.45] text-ink relative">
                    <span className="absolute left-0 top-[5px] h-[8px] w-[8px] rounded-full bg-gold" />
                    A new listing aligns with your Mumbai alert.
                    <small className="block text-[10px] text-[#87949c] mt-[3px]">Today</small>
                  </div>
                  <div className="pl-[18px] text-[12px] leading-[1.45] text-ink relative">
                    <span className="absolute left-0 top-[5px] h-[8px] w-[8px] rounded-full bg-gold" />
                    Your viewing enquiry was received by the property advisor.
                    <small className="block text-[10px] text-[#87949c] mt-[3px]">Yesterday</small>
                  </div>
                  <div className="pl-[18px] text-[12px] leading-[1.45] text-ink relative">
                    <span className="absolute left-0 top-[5px] h-[8px] w-[8px] rounded-full bg-gold" />
                    A saved villa in Goa has a new price.
                    <small className="block text-[10px] text-[#87949c] mt-[3px]">3 days ago</small>
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
                      <Link href={`/properties/${p.id}`} className="hover:text-gold transition-colors block">
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
                  No saved spaces yet.<br /><br />
                  <Link href="/properties" className="inline-block bg-navy !text-white font-bold px-4 py-2 rounded">
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
                      <h3 className="text-[13px] font-bold m-0 mb-[5px] text-ink">{a.name}</h3>
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
                  No match alerts yet.<br /><br />
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

        {/* ENQUIRIES / MESSAGES VIEW */}
        {(currentView === "enquiries" || currentView === "messages") && (
          <div className="w-full">
            <style dangerouslySetInnerHTML={{ __html: `
              .pn-enquiries{--pn-navy:#07182d;--pn-gold:#cb8d31;--pn-ink:#172633;--pn-muted:#6c7b86;--pn-line:#dde4e6;--pn-wa:#128c5b;--pn-wa-soft:#f3fbf6;--pn-mail:#236bc7;--pn-mail-soft:#f5f9ff;color:var(--pn-ink);font-family:'DM Sans',Arial,sans-serif;max-width:1120px;margin:0 auto;padding:8px 0 54px}
              .pn-enquiries *{box-sizing:border-box}
              .pn-enquiries h1,.pn-enquiries h2{font-family:'Playfair Display',Georgia,serif;font-weight:500;letter-spacing:-1.2px}
              .pn-enquiries .pn-eyebrow{margin:0 0 8px;color:var(--pn-gold);font-size:10px;font-weight:700;letter-spacing:1.55px;text-transform:uppercase}
              .pn-enquiries .pn-page-head{border-bottom:1px solid var(--pn-line);padding:0 0 26px;margin-bottom:35px}
              .pn-enquiries h1{font-size:42px;line-height:1.08;margin:0}
              .pn-enquiries .pn-page-head>p{margin:9px 0 0;color:var(--pn-muted);font-size:14px}
              .pn-enquiries .pn-section-head{margin:0 0 19px}
              .pn-enquiries .pn-section-head h2{font-size:27px;margin:0 0 7px}
              .pn-enquiries .pn-section-head p{font-size:13px;line-height:1.6;color:var(--pn-muted);margin:0}
              .pn-contact-stack{display:grid;gap:0}
              .pn-contact-card{display:grid;grid-template-columns:72px minmax(0,1fr) auto;gap:20px;align-items:center;border:1px solid var(--pn-line);min-height:166px;padding:27px 29px;background:#fff;box-shadow:0 7px 20px rgba(14,37,57,.045)}
              .pn-contact-card.whatsapp{background:var(--pn-wa-soft);border-color:#cbe8d8}
              .pn-contact-card.email{background:var(--pn-mail-soft);border-color:#d6e5fa}
              .pn-contact-icon{height:58px;width:58px;border-radius:50%;display:grid;place-items:center}
              .pn-contact-icon svg{width:27px;height:27px}
              .whatsapp .pn-contact-icon{background:#dff4e8;color:var(--pn-wa)}
              .email .pn-contact-icon{background:#e4efff;color:var(--pn-mail)}
              .pn-contact-label{display:block;font-size:10px;font-weight:700;letter-spacing:1.4px;text-transform:uppercase;margin-bottom:7px}
              .whatsapp .pn-contact-label{color:#187450}
              .email .pn-contact-label{color:#2967af}
              .pn-contact-card h3{font-size:20px;line-height:1.2;margin:0 0 7px;color:var(--pn-ink)}
              .pn-contact-card p{color:#61727b;font-size:13px;line-height:1.55;margin:0;max-width:500px}
              .pn-contact-detail{display:block;font-size:14px;font-weight:700;margin-top:10px;text-decoration:none}
              .pn-contact-detail:hover{text-decoration:underline}
              .whatsapp .pn-contact-detail{color:#0a7350}
              .email .pn-contact-detail{color:#1f61b0;overflow-wrap:anywhere}
              .pn-contact-button{border:0;border-radius:7px;padding:12px 16px;font-size:12px;font-weight:700;white-space:nowrap;text-decoration:none;cursor:pointer;display:inline-flex;align-items:center;justify-content:center;min-height:43px;transition:background 0.2s}
              .whatsapp .pn-contact-button{background:var(--pn-wa);color:#fff !important}
              .whatsapp .pn-contact-button:hover{background:#0c7049}
              .email .pn-contact-button{background:var(--pn-mail);color:#fff !important}
              .email .pn-contact-button:hover{background:#1959a7}
              .pn-or{display:flex;align-items:center;justify-content:center;gap:13px;margin:25px 0;color:#8a969d;font-size:10px;font-weight:700;letter-spacing:1.3px}
              .pn-or:before,.pn-or:after{content:'';height:1px;background:var(--pn-line);flex:1}
              .pn-support-strip{display:grid;grid-template-columns:auto 1fr auto;align-items:center;gap:16px;background:#fff;border:1px solid var(--pn-line);margin-top:28px;padding:17px 21px}
              .pn-support-icon{height:35px;width:35px;border-radius:50%;display:grid;place-items:center;background:#f6f1e8;color:var(--pn-gold)}
              .pn-support-icon svg{width:18px;height:18px}
              .pn-support-strip b{display:block;font-size:13px;color:var(--pn-ink)}
              .pn-support-strip p{font-size:11px;color:var(--pn-muted);margin:4px 0 0}
              .pn-support-phone{color:var(--pn-navy);font-size:14px;font-weight:700;text-decoration:none;white-space:nowrap}
              .pn-support-phone:hover{text-decoration:underline}
              @media(max-width:760px){
                .pn-enquiries{padding:0 0 35px}
                .pn-enquiries h1{font-size:35px}
                .pn-contact-card{grid-template-columns:55px 1fr;padding:22px;gap:15px}
                .pn-contact-icon{height:48px;width:48px}
                .pn-contact-icon svg{height:23px;width:23px}
                .pn-contact-button{grid-column:1/-1;width:100%;margin-top:2px}
                .pn-support-strip{grid-template-columns:35px 1fr}
                .pn-support-phone{grid-column:1/-1;padding:5px 0 0 51px}
              }
              @media(max-width:420px){
                .pn-enquiries h1{font-size:32px}
                .pn-contact-card{padding:18px}
                .pn-contact-card h3{font-size:18px}
                .pn-contact-card p{font-size:12px}
                .pn-support-strip{padding:16px}
              }
            `}} />

            <main className="pn-enquiries" aria-labelledby="pn-enquiries-title">
              <header className="pn-page-head">
                <p className="pn-eyebrow">PropertiesNexus support</p>
                <h1 id="pn-enquiries-title">My Enquiries</h1>
                <p>Connect with our team for any property related assistance.</p>
              </header>

              <section aria-labelledby="pn-conversation-title">
                <div className="pn-section-head">
                  <h2 id="pn-conversation-title">Start Conversation With Us</h2>
                  <p>Choose your preferred way to get in touch with our property experts.</p>
                </div>

                <div className="pn-contact-stack">
                  <article className="pn-contact-card whatsapp" aria-labelledby="pn-whatsapp-heading">
                    <div className="pn-contact-icon" aria-hidden="true">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M20.5 11.6a8.4 8.4 0 0 1-12.4 7.35L3.5 20.5l1.55-4.38A8.4 8.4 0 1 1 20.5 11.6Z" />
                        <path d="M8.5 8.2c.2-.48.42-.5.7-.51h.43c.13 0 .34.05.43.28l.72 1.75c.08.2.04.36-.04.5l-.31.48c-.1.12-.2.25-.09.45.11.2.5.83 1.08 1.34.75.67 1.37.87 1.58.97.2.1.32.08.44-.05l.55-.64c.14-.17.29-.14.49-.07l1.84.87c.22.11.36.17.41.27.05.1.05.6-.15 1.16-.2.56-1.13 1.07-1.56 1.13-.4.06-.91.09-1.47-.1-.34-.11-.77-.25-1.33-.49-2.33-1-3.86-3.31-3.98-3.46-.12-.15-.95-1.26-.95-2.4 0-1.15.6-1.71.82-1.94Z" />
                      </svg>
                    </div>
                    <div>
                      <span className="pn-contact-label">WhatsApp</span>
                      <h3 id="pn-whatsapp-heading">Chat with us on WhatsApp</h3>
                      <p>Get instant support from our property advisors.<br />We usually reply within a few minutes.</p>
                      <a
                        className="pn-contact-detail"
                        href="https://wa.me/919136331992?text=Hello%20PropertiesNexus%2C%20I%20have%20a%20property%20enquiry."
                        aria-label="Chat with PropertiesNexus on WhatsApp at 91363 31992"
                      >
                        91363 31992
                      </a>
                    </div>
                    <a
                      className="pn-contact-button"
                      href="https://wa.me/919136331992?text=Hello%20PropertiesNexus%2C%20I%20have%20a%20property%20enquiry."
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label="Start a WhatsApp chat with PropertiesNexus"
                    >
                      Start WhatsApp Chat
                    </a>
                  </article>

                  <div className="pn-or" role="separator" aria-label="or"><span>OR</span></div>

                  <article className="pn-contact-card email" aria-labelledby="pn-email-heading">
                    <div className="pn-contact-icon" aria-hidden="true">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                        <rect x="3" y="5" width="18" height="14" rx="2" />
                        <path d="m4 7 8 6 8-6" />
                      </svg>
                    </div>
                    <div>
                      <span className="pn-contact-label">Email</span>
                      <h3 id="pn-email-heading">Email us your enquiry</h3>
                      <p>Share your requirements with us and our team will get back to you soon.</p>
                      <a
                        className="pn-contact-detail"
                        href="mailto:propertiesnexuss@gmail.com?subject=Property%20Enquiry%20-%20PropertiesNexus"
                        aria-label="Email PropertiesNexus at propertiesnexuss@gmail.com"
                      >
                        propertiesnexuss@gmail.com
                      </a>
                    </div>
                    <a
                      className="pn-contact-button"
                      href="mailto:propertiesnexuss@gmail.com?subject=Property%20Enquiry%20-%20PropertiesNexus"
                      aria-label="Send a property enquiry by email"
                    >
                      Send Email Enquiry
                    </a>
                  </article>
                </div>
              </section>

              <aside className="pn-support-strip" aria-label="Direct phone support">
                <span className="pn-support-icon" aria-hidden="true">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M22 16.92v2.2a2 2 0 0 1-2.18 2 19.8 19.8 0 0 1-8.64-3.08 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 3.36 2 2 0 0 1 4.1 1.2h2.2a2 2 0 0 1 2 1.72c.12.9.34 1.78.65 2.63a2 2 0 0 1-.45 2.1L7.57 8.6a16 16 0 0 0 6 6l.95-.94a2 2 0 0 1 2.1-.45c.85.31 1.73.53 2.63.65A2 2 0 0 1 22 16.92Z" />
                  </svg>
                </span>
                <div>
                  <b>Need immediate assistance?</b>
                  <p>Call our support team and we'll be happy to help you.</p>
                </div>
                <a className="pn-support-phone" href="tel:+919136331992" aria-label="Call PropertiesNexus support at +91 91363 31992">
                  +91 91363 31992
                </a>
              </aside>
            </main>
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
                  Build your listing at your pace, then bring it to the right audience.
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
                  <article key={idx} className="bg-white border border-line rounded overflow-hidden flex flex-col">
                    <div
                      className="h-[150px] bg-cover bg-center"
                      style={{
                        backgroundImage: `url('${idx % 2
                            ? "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=750&q=80"
                            : "https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?auto=format&fit=crop&w=750&q=80"
                          }')`,
                      }}
                    />
                    <div className="p-[14px] flex flex-col flex-1">
                      <span
                        className={`text-[9px] font-bold p-[5px_7px] rounded-[12px] w-max uppercase ${item.status === "Draft"
                            ? "bg-[#fff5df] text-[#a16d14]"
                            : "bg-[#eaf7ef] text-green"
                          }`}
                      >
                        {item.status}
                      </span>
                      <h3 className="text-[13px] font-bold my-[9px] mb-[4px] text-ink">{item.title}</h3>
                      <p className="text-[10px] text-muted m-0 mb-[10px]">
                        {item.type} · {item.city} · {item.beds} Bed
                      </p>
                      <b className="text-[12px] font-bold text-ink mt-auto">{item.price}</b>
                      <div className="flex gap-[8px] mt-[13px] pt-[10px] border-t border-line">
                        <button
                          onClick={() => showToast("The full listing editor will be connected to secure property management.")}
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
                  No property drafts or live listings yet.<br /><br />
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
                <h2 className="text-[15px] font-bold m-0 mb-[5px] text-ink">Profile</h2>
                <p className="text-[11px] text-muted m-0 mb-[16px]">Your visible account details.</p>
                <div className="grid grid-cols-[auto_1fr] max-sm:grid-cols-1 gap-[15px] items-start">
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
                  <div className="grid grid-cols-2 max-sm:grid-cols-1 gap-[12px]">
                    <label className="block">
                      <span className="block text-[11px] font-bold text-ink mb-[7px]">Display name</span>
                      <input
                        type="text"
                        value={nameInput}
                        onChange={(e) => setNameInput(e.target.value)}
                        className="border border-line rounded-[7px] w-full p-[10px] text-[12px] bg-white text-ink outline-0 focus:border-[#d49a38] transition-colors"
                      />
                    </label>
                    <label className="block">
                      <span className="block text-[11px] font-bold text-ink mb-[7px]">Email address</span>
                      <input
                        type="email"
                        value={emailInput}
                        onChange={(e) => setEmailInput(e.target.value)}
                        className="border border-line rounded-[7px] w-full p-[10px] text-[12px] bg-white text-ink outline-0 focus:border-[#d49a38] transition-colors"
                      />
                    </label>
                    <label className="block">
                      <span className="block text-[11px] font-bold text-ink mb-[7px]">Phone number</span>
                      <input
                        type="tel"
                        value={phoneInput}
                        onChange={(e) => setPhoneInput(e.target.value)}
                        className="border border-line rounded-[7px] w-full p-[10px] text-[12px] bg-white text-ink outline-0 focus:border-[#d49a38] transition-colors"
                      />
                    </label>
                    <label className="block">
                      <span className="block text-[11px] font-bold text-ink mb-[7px]">Location</span>
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
                <h2 className="text-[15px] font-bold m-0 mb-[5px] text-ink">Notifications</h2>
                <p className="text-[11px] text-muted m-0 mb-[16px]">Choose the updates you would like to receive.</p>

                <div className="flex justify-between items-center py-[15px] border-b border-[#edf0f1]">
                  <div>
                    <b className="block text-[12px] font-bold text-ink">Property matches</b>
                    <p className="text-[10px] text-muted m-0 mt-[4px] max-w-[540px]">
                      Receive updates when a new property matches an active alert.
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
                    <b className="block text-[12px] font-bold text-ink">Saved property changes</b>
                    <p className="text-[10px] text-muted m-0 mt-[4px] max-w-[540px]">
                      Get important availability and price updates for saved homes.
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
                    <b className="block text-[12px] font-bold text-ink">PropertiesNexus weekly edit</b>
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
                <h2 className="text-[15px] font-bold m-0 mb-[5px] text-ink">Account safety</h2>
                <p className="text-[11px] text-muted m-0 mb-[16px]">
                  Your password and secure verification will be connected once live account authentication is enabled.
                </p>
                <button
                  onClick={() => showToast("Security controls will be available with secure authentication.")}
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
                <h2 className="font-serif text-xl font-bold m-0 mb-[7px] text-ink">Create a match alert</h2>
                <p className="text-[11px] text-muted m-0 leading-[1.55]">
                  Tell us what you are looking for and we will keep watch.
                </p>
                <div className="grid grid-cols-2 max-sm:grid-cols-1 gap-[12px] my-[17px]">
                  <label className="col-span-full">
                    <span className="block text-[11px] font-bold text-ink mb-[6px]">Alert name</span>
                    <input
                      required
                      value={alertName}
                      onChange={(e) => setAlertName(e.target.value)}
                      placeholder="e.g. Homes in Bengaluru"
                      className="border border-line rounded-[7px] w-full p-[10px] text-[12px] bg-white text-ink outline-0"
                    />
                  </label>
                  <label>
                    <span className="block text-[11px] font-bold text-ink mb-[6px]">Purpose</span>
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
                    <span className="block text-[11px] font-bold text-ink mb-[6px]">Property type</span>
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
                    <span className="block text-[11px] font-bold text-ink mb-[6px]">Location or area</span>
                    <input
                      required
                      value={alertArea}
                      onChange={(e) => setAlertArea(e.target.value)}
                      placeholder="City or locality"
                      className="border border-line rounded-[7px] w-full p-[10px] text-[12px] bg-white text-ink outline-0"
                    />
                  </label>
                </div>
                <button type="submit" className="w-full bg-navy !text-white font-bold p-[11px] rounded-[7px] border-0 cursor-pointer">
                  Save alert
                </button>
              </form>
            )}

            {modalType === "listing" && (
              <form onSubmit={handleCreateListing}>
                <h2 className="font-serif text-xl font-bold m-0 mb-[7px] text-ink">Add a property</h2>
                <p className="text-[11px] text-muted m-0 leading-[1.55]">
                  Start your listing now. You can add photos and verification details when publishing.
                </p>
                <div className="grid grid-cols-2 max-sm:grid-cols-1 gap-[12px] my-[17px]">
                  <label>
                    <span className="block text-[11px] font-bold text-ink mb-[6px]">Property title</span>
                    <input
                      required
                      value={listTitle}
                      onChange={(e) => setListTitle(e.target.value)}
                      placeholder="e.g. Garden View Apartment"
                      className="border border-line rounded-[7px] w-full p-[10px] text-[12px] bg-white text-ink outline-0"
                    />
                  </label>
                  <label>
                    <span className="block text-[11px] font-bold text-ink mb-[6px]">Property type</span>
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
                    <span className="block text-[11px] font-bold text-ink mb-[6px]">City</span>
                    <input
                      required
                      value={listCity}
                      onChange={(e) => setListCity(e.target.value)}
                      placeholder="e.g. Mumbai"
                      className="border border-line rounded-[7px] w-full p-[10px] text-[12px] bg-white text-ink outline-0"
                    />
                  </label>
                  <label>
                    <span className="block text-[11px] font-bold text-ink mb-[6px]">Asking price</span>
                    <input
                      required
                      value={listPrice}
                      onChange={(e) => setListPrice(e.target.value)}
                      placeholder="e.g. ₹ 1.25 Cr"
                      className="border border-line rounded-[7px] w-full p-[10px] text-[12px] bg-white text-ink outline-0"
                    />
                  </label>
                  <label>
                    <span className="block text-[11px] font-bold text-ink mb-[6px]">Bedrooms</span>
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
                    <span className="block text-[11px] font-bold text-ink mb-[6px]">Contact number</span>
                    <input
                      required
                      placeholder="+91 00000 00000"
                      className="border border-line rounded-[7px] w-full p-[10px] text-[12px] bg-white text-ink outline-0"
                    />
                  </label>
                </div>
                <button type="submit" className="w-full bg-navy !text-white font-bold p-[11px] rounded-[7px] border-0 cursor-pointer">
                  Save as draft
                </button>
              </form>
            )}

            {modalType === "message" && (
              <form onSubmit={handleCreateMessage}>
                <h2 className="font-serif text-xl font-bold m-0 mb-[7px] text-ink">Start a conversation</h2>
                <p className="text-[11px] text-muted m-0 leading-[1.55]">
                  Send an advisor a property enquiry.
                </p>
                <div className="grid gap-[12px] my-[17px]">
                  <label>
                    <span className="block text-[11px] font-bold text-ink mb-[6px]">Property or topic</span>
                    <input
                      required
                      value={msgTopic}
                      onChange={(e) => setMsgTopic(e.target.value)}
                      placeholder="What would you like to discuss?"
                      className="border border-line rounded-[7px] w-full p-[10px] text-[12px] bg-white text-ink outline-0"
                    />
                  </label>
                  <label>
                    <span className="block text-[11px] font-bold text-ink mb-[6px]">Message</span>
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
                <button type="submit" className="w-full bg-navy !text-white font-bold p-[11px] rounded-[7px] border-0 cursor-pointer">
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
    <Suspense fallback={<div className="p-8 font-serif text-xl">Loading Account Home Base...</div>}>
      <UserDashboardContent />
    </Suspense>
  );
}