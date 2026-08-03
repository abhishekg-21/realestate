"use client";

import Link from "next/link";

export default function Footer() {
  return (
    <>
      <footer className="bg-[#041222] text-white pt-[50px] pb-[22px]" id="contact">
        <div className="max-w-[1216px] w-[calc(100%-48px)] max-md:w-[calc(100%-32px)] mx-auto">
          <div className="flex max-md:flex-col justify-between items-start pb-[45px] gap-5">
            <div>
              <Link href="/" className="font-bold tracking-[1.2px] text-[22px] flex items-center whitespace-nowrap">
                <span className="inline-flex items-end gap-[2px] mr-2 h-[23px]">
                  <i className="block w-[4px] h-[11px] bg-gold" />
                  <i className="block w-[4px] h-[20px] bg-gold" />
                  <i className="block w-[4px] h-[15px] bg-gold" />
                </span>
                Properties<span className="font-normal opacity-75">Nexus</span>
              </Link>
              <p className="text-[13px] text-[#adbac7] my-[13px]">
                India&apos;s considered property network.
              </p>
            </div>

            <div>
              <p className="text-[13px] text-[#adbac7] my-[13px]">Talk to a property advisor</p>
              <a className="text-[20px] font-serif hover:text-gold transition-colors" href="tel:+919136331992">
                +91 91363 31992
              </a>
            </div>

            <a
              className="inline-block mt-[13px] bg-white text-ink px-[17px] py-[14px] text-[12px] font-bold rounded hover:bg-gray-100 transition-colors"
              href="https://wa.me/919136331992"
              target="_blank"
              rel="noopener noreferrer"
            >
              WhatsApp us →
            </a>
          </div>

          <div className="border-t border-white/17 pt-[20px] flex max-md:flex-col justify-between text-[#8796a5] text-[11px] gap-5">
            <span>© 2026 PropertiesNexus. All rights reserved.</span>
            <div className="flex gap-[20px]">
              <Link href="/" className="hover:text-white transition-colors">Privacy</Link>
              <Link href="/" className="hover:text-white transition-colors">Terms</Link>
              <Link href="/" className="hover:text-white transition-colors">Accessibility</Link>
            </div>
          </div>
        </div>
      </footer>

      {/* Mobile Bottom Navigation Bar */}
      <nav className="md:hidden fixed bottom-[15px] left-1/2 -translate-x-1/2 flex z-40 bg-white text-ink shadow-[0_8px_26px_rgba(0,0,0,0.24)] px-[17px] py-[14px] rounded-[29px] gap-[16px] whitespace-nowrap text-[12px]">
        <Link href="/properties" className="font-bold hover:text-navy">
          ⌖ Map
        </Link>
        <Link href="/properties" className="font-bold pl-[16px] border-l border-[#dce0e3] hover:text-navy">
          ⌕ Properties
        </Link>
        <a
          href="https://wa.me/919136331992"
          target="_blank"
          rel="noopener noreferrer"
          className="font-bold pl-[16px] border-l border-[#dce0e3] text-green hover:opacity-80"
        >
          WhatsApp
        </a>
      </nav>
    </>
  );
}
