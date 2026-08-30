// src/app/user-dashboard/enquiries/page.tsx
"use client";

export default function EnquiriesPage() {
    return (
        <div className="flex flex-col min-h-screen bg-paper font-sans">
            {/* Header */}
            <header className="h-[74px] max-md:h-[63px] bg-white border-b border-line flex items-center px-[clamp(20px,4vw,52px)] max-md:px-[16px]">
                <span className="text-[12px] text-[#74828d]">My account / My Enquiries</span>
            </header>

            <div className="max-w-[1280px] w-full p-[37px_clamp(20px,4vw,52px)_70px] max-md:p-[25px_16px_55px] mx-auto flex-1">
                <style dangerouslySetInnerHTML={{
                    __html: `
          .pn-enq { --wa:#128c5b; --wa-soft:#f3fbf6; --mail:#236bc7; --mail-soft:#f5f9ff; }
          .pn-contact-card { display:grid; grid-template-columns:72px minmax(0,1fr) auto; gap:20px; align-items:center; border:1px solid #dde4e6; min-height:160px; padding:27px 29px; background:#fff; box-shadow:0 7px 20px rgba(14,37,57,.045); }
          .pn-contact-card.wa { background:var(--wa-soft,#f3fbf6); border-color:#cbe8d8; }
          .pn-contact-card.em { background:var(--mail-soft,#f5f9ff); border-color:#d6e5fa; }
          .pn-icon { height:58px; width:58px; border-radius:50%; display:grid; place-items:center; }
          .pn-icon svg { width:27px; height:27px; }
          .wa .pn-icon { background:#dff4e8; color:#128c5b; }
          .em .pn-icon { background:#e4efff; color:#236bc7; }
          .pn-channel { display:block; font-size:10px; font-weight:700; letter-spacing:1.4px; text-transform:uppercase; margin-bottom:7px; }
          .wa .pn-channel { color:#187450; }
          .em .pn-channel { color:#2967af; }
          .pn-contact-card h3 { font-size:20px; line-height:1.2; margin:0 0 7px; color:#172633; font-family:'Playfair Display',Georgia,serif; font-weight:500; }
          .pn-contact-card p { color:#61727b; font-size:13px; line-height:1.55; margin:0; max-width:500px; }
          .pn-detail { display:block; font-size:14px; font-weight:700; margin-top:10px; text-decoration:none; }
          .pn-detail:hover { text-decoration:underline; }
          .wa .pn-detail { color:#0a7350; }
          .em .pn-detail { color:#1f61b0; overflow-wrap:anywhere; }
          .pn-btn { border:0; border-radius:7px; padding:12px 16px; font-size:12px; font-weight:700; white-space:nowrap; text-decoration:none; cursor:pointer; display:inline-flex; align-items:center; justify-content:center; min-height:43px; transition:background .2s; }
          .wa .pn-btn { background:#128c5b; color:#fff !important; }
          .wa .pn-btn:hover { background:#0c7049; }
          .em .pn-btn { background:#236bc7; color:#fff !important; }
          .em .pn-btn:hover { background:#1959a7; }
          .pn-or { display:flex; align-items:center; justify-content:center; gap:13px; margin:22px 0; color:#8a969d; font-size:10px; font-weight:700; letter-spacing:1.3px; }
          .pn-or:before,.pn-or:after { content:''; height:1px; background:#dde4e6; flex:1; }
          .pn-strip { display:grid; grid-template-columns:auto 1fr auto; align-items:center; gap:16px; background:#fff; border:1px solid #dde4e6; margin-top:28px; padding:17px 21px; }
          .pn-strip-icon { height:35px; width:35px; border-radius:50%; display:grid; place-items:center; background:#f6f1e8; color:#cb8d31; }
          .pn-strip-icon svg { width:18px; height:18px; }
          .pn-strip b { display:block; font-size:13px; color:#172633; }
          .pn-strip p { font-size:11px; color:#6a7984; margin:4px 0 0; }
          .pn-phone { color:#07182d; font-size:14px; font-weight:700; text-decoration:none; white-space:nowrap; }
          .pn-phone:hover { text-decoration:underline; }
          @media(max-width:760px){
            .pn-contact-card { grid-template-columns:55px 1fr; padding:22px; gap:15px; }
            .pn-icon { height:48px; width:48px; }
            .pn-icon svg { height:23px; width:23px; }
            .pn-btn { grid-column:1/-1; width:100%; margin-top:4px; }
            .pn-strip { grid-template-columns:35px 1fr; }
            .pn-phone { grid-column:1/-1; padding:5px 0 0 51px; }
          }
          @media(max-width:420px){
            .pn-contact-card { padding:18px; }
            .pn-contact-card h3 { font-size:18px; }
            .pn-contact-card p { font-size:12px; }
          }
        `}} />

                {/* Page heading */}
                <div className="mb-[32px]">
                    <p className="text-[10px] uppercase tracking-[1.55px] font-bold text-[#cb8d31] m-0 mb-[8px]">
                        PropertiesNexus support
                    </p>
                    <h1 className="font-serif text-[34px] max-sm:text-[28px] font-medium tracking-[-1.6px] m-0 text-ink">
                        My Enquiries
                    </h1>
                    <p className="text-[13px] text-muted mt-[9px] mb-0 max-w-[520px] leading-[1.65]">
                        Connect with our team for any property-related assistance. We're here to help.
                    </p>
                </div>

                {/* Section heading */}
                <div className="mb-[20px]">
                    <h2 className="font-serif text-[24px] font-medium tracking-[-0.8px] m-0 mb-[6px] text-ink">
                        Start a Conversation
                    </h2>
                    <p className="text-[13px] text-muted m-0 leading-[1.6]">
                        Choose your preferred way to get in touch with our property experts.
                    </p>
                </div>

                {/* Contact cards */}
                <div className="pn-enq">
                    {/* WhatsApp */}
                    <article className="pn-contact-card wa" aria-labelledby="pn-wa-head">
                        <div className="pn-icon" aria-hidden="true">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M20.5 11.6a8.4 8.4 0 0 1-12.4 7.35L3.5 20.5l1.55-4.38A8.4 8.4 0 1 1 20.5 11.6Z" />
                                <path d="M8.5 8.2c.2-.48.42-.5.7-.51h.43c.13 0 .34.05.43.28l.72 1.75c.08.2.04.36-.04.5l-.31.48c-.1.12-.2.25-.09.45.11.2.5.83 1.08 1.34.75.67 1.37.87 1.58.97.2.1.32.08.44-.05l.55-.64c.14-.17.29-.14.49-.07l1.84.87c.22.11.36.17.41.27.05.1.05.6-.15 1.16-.2.56-1.13 1.07-1.56 1.13-.4.06-.91.09-1.47-.1-.34-.11-.77-.25-1.33-.49-2.33-1-3.86-3.31-3.98-3.46-.12-.15-.95-1.26-.95-2.4 0-1.15.6-1.71.82-1.94Z" />
                            </svg>
                        </div>
                        <div>
                            <span className="pn-channel">WhatsApp</span>
                            <h3 id="pn-wa-head">Chat with us on WhatsApp</h3>
                            <p>Get instant support from our property advisors. We usually reply within a few minutes.</p>
                            <a
                                className="pn-detail"
                                href="https://wa.me/919136331992?text=Hello%20PropertiesNexus%2C%20I%20have%20a%20property%20enquiry."
                                aria-label="Chat with PropertiesNexus on WhatsApp at 91363 31992"
                            >
                                91363 31992
                            </a>
                        </div>
                        <a
                            className="pn-btn"
                            href="https://wa.me/919136331992?text=Hello%20PropertiesNexus%2C%20I%20have%20a%20property%20enquiry."
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            Start WhatsApp Chat
                        </a>
                    </article>

                    <div className="pn-or" role="separator" aria-label="or"><span>OR</span></div>

                    {/* Email */}
                    <article className="pn-contact-card em" aria-labelledby="pn-em-head">
                        <div className="pn-icon" aria-hidden="true">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                                <rect x="3" y="5" width="18" height="14" rx="2" />
                                <path d="m4 7 8 6 8-6" />
                            </svg>
                        </div>
                        <div>
                            <span className="pn-channel">Email</span>
                            <h3 id="pn-em-head">Email us your enquiry</h3>
                            <p>Share your requirements with us and our team will get back to you soon.</p>
                            <a
                                className="pn-detail"
                                href="mailto:propertiesnexuss@gmail.com?subject=Property%20Enquiry%20-%20PropertiesNexus"
                            >
                                propertiesnexuss@gmail.com
                            </a>
                        </div>
                        <a
                            className="pn-btn"
                            href="mailto:propertiesnexuss@gmail.com?subject=Property%20Enquiry%20-%20PropertiesNexus"
                        >
                            Send Email Enquiry
                        </a>
                    </article>

                    {/* Phone strip */}
                    <aside className="pn-strip" aria-label="Direct phone support">
                        <span className="pn-strip-icon" aria-hidden="true">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M22 16.92v2.2a2 2 0 0 1-2.18 2 19.8 19.8 0 0 1-8.64-3.08 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 3.36 2 2 0 0 1 4.1 1.2h2.2a2 2 0 0 1 2 1.72c.12.9.34 1.78.65 2.63a2 2 0 0 1-.45 2.1L7.57 8.6a16 16 0 0 0 6 6l.95-.94a2 2 0 0 1 2.1-.45c.85.31 1.73.53 2.63.65A2 2 0 0 1 22 16.92Z" />
                            </svg>
                        </span>
                        <div>
                            <b>Need immediate assistance?</b>
                            <p>Call our support team and we'll be happy to help you.</p>
                        </div>
                        <a className="pn-phone" href="tel:+919136331992">+91 91363 31992</a>
                    </aside>
                </div>
            </div>
        </div>
    );
}