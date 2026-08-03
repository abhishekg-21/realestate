import Link from "next/link";
import React from "react";

interface AuthLayoutProps {
  children: React.ReactNode;
  eyebrow: string;
  title: string;
  highlightedWord: string;
  description: string;
  fact1Value: string;
  fact1Label: string;
  fact2Value: string;
  fact2Label: string;
  bgImageUrl?: string;
}

export default function AuthLayout({
  children,
  eyebrow,
  title,
  highlightedWord,
  description,
  fact1Value,
  fact1Label,
  fact2Value,
  fact2Label,
  bgImageUrl = "https://images.unsplash.com/photo-1600585154363-67eb9e2e2099?auto=format&fit=crop&w=1600&q=86",
}: AuthLayoutProps) {
  // Replace highlightedWord in title with <em>tag
  const titleParts = title.split(highlightedWord);

  return (
    <main className="min-h-screen grid grid-cols-2 max-md:grid-cols-1 bg-[#f6f5f1] text-ink font-sans">
      {/* Left Visual Panel */}
      <section
        className="text-white p-[38px_clamp(32px,6vw,82px)] max-md:p-[27px_25px] max-md:min-h-[270px] flex flex-col bg-cover bg-center"
        style={{
          backgroundImage: `linear-gradient(145deg, rgba(3,17,32,0.91), rgba(8,39,67,0.69)), url('${bgImageUrl}')`,
        }}
      >
        <Link href="/" className="font-bold tracking-[1px] text-[19px] flex items-center text-white">
          <span className="inline-flex items-end gap-[2px] mr-2 h-[21px]">
            <i className="block w-[4px] h-[10px] bg-gold" />
            <i className="block w-[4px] h-[18px] bg-gold" />
            <i className="block w-[4px] h-[14px] bg-gold" />
          </span>
          Properties<span className="font-normal opacity-80">Nexus</span>
        </Link>

        <div className="my-auto max-md:mt-auto">
          <p className="text-[10px] uppercase tracking-[1.6px] font-bold text-[#edc274] m-0">
            {eyebrow}
          </p>
          <h1 className="font-serif text-[clamp(44px,5vw,68px)] max-md:text-[38px] font-medium tracking-[-2px] leading-[1.06] max-w-[510px] my-[17px]">
            {titleParts.length > 1 ? (
              <>
                {titleParts[0]}
                <em className="not-italic text-[#f1be4e]">{highlightedWord}</em>
                {titleParts[1]}
              </>
            ) : (
              title
            )}
          </h1>
          <p className="max-w-[420px] text-[#d5e0eb] leading-[1.7] text-[15px] m-0 max-md:hidden">
            {description}
          </p>
        </div>

        <div className="flex gap-[28px] border-t border-white/27 pt-[19px] max-md:hidden mt-auto">
          <div>
            <b className="block font-serif text-[24px] font-medium text-white">{fact1Value}</b>
            <span className="text-[9px] uppercase tracking-[0.8px] text-[#c2d0dd] block mt-1">
              {fact1Label}
            </span>
          </div>
          <div>
            <b className="block font-serif text-[24px] font-medium text-white">{fact2Value}</b>
            <span className="text-[9px] uppercase tracking-[0.8px] text-[#c2d0dd] block mt-1">
              {fact2Label}
            </span>
          </div>
        </div>
      </section>

      {/* Right Auth Form Section */}
      <section className="flex items-center justify-center p-[42px] max-md:p-[35px_24px]">
        <div className="w-[min(100%,405px)]">
          <Link
            href="/"
            className="text-[12px] text-[#667581] hover:underline inline-block mb-[40px] max-md:mb-[27px] font-semibold"
          >
            ← Back to PropertiesNexus
          </Link>
          {children}
        </div>
      </section>
    </main>
  );
}
