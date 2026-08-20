import Navbar from "@/components/navbar";
import Footer from "@/components/footer";
import Link from "next/link";
import { ArrowRight, Users, Target, ShieldCheck, MapPin } from "lucide-react";

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-paper text-ink font-sans selection:bg-[#d49a38]/30 selection:text-ink">
      <Navbar variant="light" />

      {/* Hero Section */}
      <section className="relative pt-[120px] pb-[80px] overflow-hidden">
        <div className="absolute inset-0 bg-[#051426] z-0"></div>
        <div className="absolute inset-0 opacity-20 bg-[url('https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=2000&q=80')] bg-cover bg-center mix-blend-overlay z-0"></div>
        <div className="max-w-[1216px] w-[calc(100%-48px)] mx-auto relative z-10 text-white text-center">
          <p className="text-[#d49a38] font-bold uppercase tracking-[2px] text-[12px] mb-4">
            PropertiesNexus
          </p>
          <h1 className="font-serif text-[clamp(40px,6vw,64px)] leading-[1.1] font-medium tracking-tight mb-6 max-w-4xl mx-auto">
            Redefining the standard for luxury real estate across India.
          </h1>
          <p className="text-[16px] md:text-[18px] text-white/80 max-w-2xl mx-auto leading-relaxed mb-10">
            We connect discerning buyers with exceptional properties, offering a
            curated platform built on trust, verified listings, and a seamless
            digital experience.
          </p>
        </div>
      </section>

      {/* Stats/Values Section */}
      <section className="py-20 bg-white border-b border-line">
        <div className="max-w-[1216px] w-[calc(100%-48px)] mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="p-6 text-center border-b md:border-b-0 md:border-r border-line">
              <div className="text-[#d49a38] text-[36px] mb-2 flex justify-center">
                <Users size={40} />
              </div>
              <h3 className="text-[32px] font-serif font-medium text-ink mb-1">
                50k+
              </h3>
              <p className="text-[13px] text-muted font-semibold uppercase tracking-wider">
                Happy Clients
              </p>
            </div>
            <div className="p-6 text-center border-b md:border-b-0 md:border-r border-line">
              <div className="text-[#d49a38] text-[36px] mb-2 flex justify-center">
                <Target size={40} />
              </div>
              <h3 className="text-[32px] font-serif font-medium text-ink mb-1">
                10k+
              </h3>
              <p className="text-[13px] text-muted font-semibold uppercase tracking-wider">
                Properties Sold
              </p>
            </div>
            <div className="p-6 text-center border-b md:border-b-0 md:border-r border-line">
              <div className="text-[#d49a38] text-[36px] mb-2 flex justify-center">
                <ShieldCheck size={40} />
              </div>
              <h3 className="text-[32px] font-serif font-medium text-ink mb-1">
                100%
              </h3>
              <p className="text-[13px] text-muted font-semibold uppercase tracking-wider">
                Verified Listings
              </p>
            </div>
            <div className="p-6 text-center">
              <div className="text-[#d49a38] text-[36px] mb-2 flex justify-center">
                <MapPin size={40} />
              </div>
              <h3 className="text-[32px] font-serif font-medium text-ink mb-1">
                20+
              </h3>
              <p className="text-[13px] text-muted font-semibold uppercase tracking-wider">
                Cities Covered
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Story Section */}
      <section className="py-[100px] bg-paper">
        <div className="max-w-[1216px] w-[calc(100%-48px)] mx-auto grid grid-cols-1 md:grid-cols-2 gap-[60px] items-center">
          <div>
            <h2 className="font-serif text-[clamp(32px,4vw,44px)] leading-tight text-ink mb-6">
              Our vision is to make finding your perfect home effortless and
              transparent.
            </h2>
            <p className="text-[15px] text-slate-600 leading-[1.8] mb-4">
              Since our inception in <strong>2020</strong>, PropertiesNexus has
              built a strong reputation as a trusted leader in the real estate
              sector. What started as a vision to simplify property transactions
              has grown into a comprehensive platform backed by integrity,
              market expertise, and an unwavering commitment to our clients.
            </p>
            <p className="text-[15px] text-slate-600 leading-[1.8] mb-4">
              Over the years, we have successfully worked on a vast portfolio of
              projects—from luxury residential villas to expansive commercial
              developments. Our stellar reputation is built on delivering
              exceptional results and ensuring that every property listed meets
              our rigorous standards for quality and authenticity.
            </p>
            <p className="text-[15px] text-slate-600 leading-[1.8] mb-8">
              We offer a full spectrum of real estate functions tailored to your
              needs, including end-to-end buying and selling assistance,
              seamless rental management, personalized property advisory, and
              legal compliance support. Whether you are a first-time buyer or a
              seasoned investor, our dedicated team is here to guide you every
              step of the way.
            </p>
            <Link
              href="/properties"
              className="inline-flex items-center gap-2 bg-[#051426] hover:bg-[#112a46] text-white px-6 py-3 rounded-xl font-bold text-[14px] transition-colors"
            >
              Explore Our Listings <ArrowRight size={18} />
            </Link>
          </div>
          <div className="relative h-[500px] rounded-2xl overflow-hidden shadow-2xl">
            <img
              src="https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&w=1200&q=80"
              alt="PropertiesNexus Office"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-tr from-[#051426]/40 to-transparent"></div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
