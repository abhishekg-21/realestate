"use client";

import Link from "next/link";
import { Facebook, Twitter, Instagram, Linkedin } from "lucide-react";

export default function Footer() {
  return (
    <>
      <footer className="bg-[#041222] text-white pt-[70px] pb-[30px]" id="contact">
        <div className="max-w-[1216px] w-[calc(100%-48px)] max-md:w-[calc(100%-32px)] mx-auto">
          
          <div className="grid grid-cols-4 max-lg:grid-cols-2 max-md:grid-cols-1 gap-10 pb-[60px] border-b border-white/10">
            {/* Brand Column */}
            <div className="col-span-1 max-lg:col-span-2 max-md:col-span-1">
              <Link href="/" className="font-bold tracking-[1.2px] text-[24px] flex items-center whitespace-nowrap mb-4 hover:text-gold transition-colors">
                <span className="inline-flex items-end gap-[2px] mr-2 h-[23px]">
                  <i className="block w-[4px] h-[11px] bg-gold" />
                  <i className="block w-[4px] h-[20px] bg-gold" />
                  <i className="block w-[4px] h-[15px] bg-gold" />
                </span>
                Properties<span className="font-normal opacity-75">Nexus</span>
              </Link>
              <p className="text-[14px] text-[#adbac7] mb-6 leading-relaxed">
                India&apos;s considered property network. Providing a premium real estate experience through verified listings, transparent pricing, and expert advisory.
              </p>
              <div className="flex gap-4">
                <a href="#" className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center hover:bg-gold hover:text-white transition-colors" aria-label="Facebook">
                  <Facebook size={18} />
                </a>
                <a href="#" className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center hover:bg-gold hover:text-white transition-colors" aria-label="Twitter">
                  <Twitter size={18} />
                </a>
                <a href="#" className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center hover:bg-gold hover:text-white transition-colors" aria-label="Instagram">
                  <Instagram size={18} />
                </a>
                <a href="#" className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center hover:bg-gold hover:text-white transition-colors" aria-label="LinkedIn">
                  <Linkedin size={18} />
                </a>
              </div>
            </div>

            {/* Links Columns */}
            <div>
              <h3 className="font-serif text-[18px] font-medium mb-6 text-white">Company</h3>
              <ul className="space-y-4 text-[14px] text-[#adbac7]">
                <li><Link href="/about" className="hover:text-gold transition-colors">About Us</Link></li>
                <li><Link href="/careers" className="hover:text-gold transition-colors">Careers</Link></li>
                <li><Link href="/press" className="hover:text-gold transition-colors">Press & Media</Link></li>
                <li><Link href="/blog" className="hover:text-gold transition-colors">Real Estate Blog</Link></li>
              </ul>
            </div>

            <div>
              <h3 className="font-serif text-[18px] font-medium mb-6 text-white">Services</h3>
              <ul className="space-y-4 text-[14px] text-[#adbac7]">
                <li><Link href="/properties?purpose=Buy" className="hover:text-gold transition-colors">Buy Property</Link></li>
                <li><Link href="/properties?purpose=Rent" className="hover:text-gold transition-colors">Rent Property</Link></li>
                <li><Link href="/business-signup" className="hover:text-gold transition-colors">Sell Property</Link></li>
                <li><Link href="/commercial" className="hover:text-gold transition-colors">Commercial Real Estate</Link></li>
              </ul>
            </div>

            <div>
              <h3 className="font-serif text-[18px] font-medium mb-6 text-white">Contact Us</h3>
              <ul className="space-y-4 text-[14px] text-[#adbac7]">
                <li className="flex flex-col">
                  <span className="text-[#8796a5] text-xs mb-1">Talk to an advisor</span>
                  <a className="text-[18px] font-bold text-white hover:text-gold transition-colors" href="tel:+919136331992">
                    +91 91363 31992
                  </a>
                </li>
                <li className="flex flex-col mt-2">
                  <span className="text-[#8796a5] text-xs mb-1">Email us</span>
                  <a className="text-[15px] font-medium hover:text-gold transition-colors" href="mailto:hello@propertiesnexus.com">
                    hello@propertiesnexus.com
                  </a>
                </li>
                <li className="mt-4">
                  <a
                    className="inline-flex items-center gap-2 bg-[#dc2626] hover:bg-[#b91c1c] text-white px-5 py-2.5 text-[13px] font-bold rounded-lg transition-colors shadow-sm"
                    href="https://wa.me/919136331992"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    💬 Chat on WhatsApp
                  </a>
                </li>
              </ul>
            </div>
          </div>

          <div className="pt-[30px] flex max-md:flex-col justify-between items-center text-[#8796a5] text-[12px] gap-4">
            <span>© 2026 PropertiesNexus. All rights reserved.</span>
            <div className="flex gap-[24px]">
              <Link href="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link>
              <Link href="/terms" className="hover:text-white transition-colors">Terms of Service</Link>
              <Link href="/sitemap" className="hover:text-white transition-colors">Sitemap</Link>
            </div>
          </div>
        </div>
      </footer>

      {/* Mobile Bottom Navigation Bar */}
      <nav className="md:hidden fixed bottom-[15px] left-1/2 -translate-x-1/2 flex z-40 bg-white/95 backdrop-blur-md text-ink shadow-[0_8px_30px_rgba(0,0,0,0.12)] border border-slate-200 px-[20px] py-[12px] rounded-full gap-[20px] whitespace-nowrap text-[12px]">
        <Link href="/properties?view=map" className="font-bold hover:text-navy flex items-center gap-1.5">
          <span>🗺️</span> Map
        </Link>
        <Link href="/properties" className="font-bold pl-[20px] border-l border-slate-200 hover:text-navy flex items-center gap-1.5">
          <span>🔍</span> Search
        </Link>
        <a
          href="https://wa.me/919136331992"
          target="_blank"
          rel="noopener noreferrer"
          className="font-bold pl-[20px] border-l border-slate-200 text-emerald-600 hover:text-emerald-700 flex items-center gap-1.5"
        >
          <span>💬</span> Chat
        </a>
      </nav>
    </>
  );
}
