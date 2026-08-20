"use client";

import Navbar from "@/components/navbar";
import Footer from "@/components/footer";
import { useState } from "react";
import { useProperties } from "@/lib/supabase-properties";
import PropertyCard from "@/components/property-card";

export default function GuidancePage() {
  const { properties } = useProperties();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("submitting");
    setTimeout(() => {
      setStatus("success");
      setName("");
      setEmail("");
      setMessage("");
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-900 font-sans flex flex-col">
      <Navbar variant="light" />

      {/* Hero Section */}
      <section className="bg-navy text-white pt-20 pb-16 px-6 relative overflow-hidden">
        <div
          className="absolute inset-0 opacity-10 pointer-events-none"
          style={{
            backgroundImage:
              "url('https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=1600&q=80')",
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        />
        <div className="max-w-[1216px] mx-auto relative z-10 text-center">
          <h1 className="text-4xl md:text-5xl font-serif font-medium mb-4">
            Expert Guidance & Support
          </h1>
          <p className="text-slate-300 max-w-2xl mx-auto text-lg">
            Whether you are looking to buy your first home, sell a commercial
            space, or need investment advisory, our expert team is here to help.
          </p>
        </div>
      </section>

      {/* Contact Section */}
      <section className="max-w-[1000px] mx-auto w-full px-6 py-16 grid grid-cols-1 md:grid-cols-2 gap-12 flex-1">
        {/* Company Details */}
        <div>
          <h2 className="text-2xl font-serif font-medium mb-6">Get in Touch</h2>
          <p className="text-slate-600 mb-8 leading-relaxed">
            Reach out to our specialized real estate advisory team. We are
            available to answer your questions and provide personalized property
            recommendations based on your unique needs.
          </p>

          <div className="space-y-6">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-full bg-gold/10 text-gold flex items-center justify-center shrink-0">
                📍
              </div>
              <div>
                <h3 className="font-bold text-slate-900">Headquarters</h3>
                <p className="text-slate-600 mt-1">
                  PropertiesNexus Tower, Level 4<br />
                  Bandra Kurla Complex, Mumbai 400051
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                ✉️
              </div>
              <div>
                <h3 className="font-bold text-slate-900">Email Us</h3>
                <a
                  href="mailto:hello@propertiesnexus.com"
                  className="text-blue-600 hover:underline mt-1 block"
                >
                  hello@propertiesnexus.com
                </a>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                📞
              </div>
              <div>
                <h3 className="font-bold text-slate-900">Call Us</h3>
                <a
                  href="tel:+919136331992"
                  className="text-slate-600 hover:text-emerald-600 transition-colors mt-1 block"
                >
                  +91 91363 31992
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Contact Form */}
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200">
          <h3 className="font-bold text-xl mb-6">Send us a message</h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                Full Name
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full border border-slate-200 rounded-xl px-4 py-3 bg-slate-50 focus:bg-white focus:border-gold outline-none transition-all"
                placeholder="John Doe"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                Email Address
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full border border-slate-200 rounded-xl px-4 py-3 bg-slate-50 focus:bg-white focus:border-gold outline-none transition-all"
                placeholder="john@example.com"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                How can we help?
              </label>
              <textarea
                required
                rows={4}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="w-full border border-slate-200 rounded-xl px-4 py-3 bg-slate-50 focus:bg-white focus:border-gold outline-none transition-all resize-none"
                placeholder="I am looking for a 3BHK in Mumbai..."
              />
            </div>
            <button
              type="submit"
              disabled={status === "submitting"}
              className="w-full bg-navy text-white font-bold py-3.5 rounded-xl hover:bg-slate-800 transition-colors disabled:opacity-70 mt-2"
            >
              {status === "submitting" ? "Sending..." : "Submit Request"}
            </button>
            {status === "success" && (
              <p className="text-emerald-600 text-sm font-bold text-center mt-2">
                Thank you! Our team will contact you shortly.
              </p>
            )}
          </form>
        </div>
      </section>

      {/* Property Recommendations */}
      <section className="bg-white py-16 border-t border-slate-200">
        <div className="max-w-[1216px] w-[calc(100%-48px)] max-md:w-[calc(100%-32px)] mx-auto">
          <div className="flex justify-between items-end mb-8">
            <div>
              <h2 className="font-serif text-[28px] font-medium text-slate-900">
                Recommended Properties
              </h2>
              <p className="text-slate-500 mt-2">
                Curated selections from our expert advisors.
              </p>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {properties.slice(0, 3).map((p) => (
              <PropertyCard key={p.id} property={p} />
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
