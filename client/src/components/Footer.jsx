import React from "react";
import { Link } from "react-router-dom";
import {
  Instagram,
  Twitter,
  ArrowRight,
  CreditCard,
  Smartphone,
  ShieldCheck,
  Globe,
  Youtube,
  Scissors,
} from "lucide-react";

const Footer = () => {
  // Common link hover style
  const linkStyle =
    "text-[10px] font-bold uppercase tracking-widest text-zinc-500 hover:text-black hover:pl-1 transition-all duration-300 block";

  // 🔥 FIX: Changed bg-white to bg-[#F8F8F8] and added a crisp top border
  return (
    <footer className="bg-[#F8F8F8] border-t border-zinc-200 text-gray-600 font-sans mt-auto selection:bg-black selection:text-white">
      <div className="max-w-[1600px] mx-auto px-4 md:px-12 pt-16 md:pt-24 pb-8 md:pb-12">
        {/* Main Footer Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-10 md:gap-16 lg:gap-8 mb-16 md:mb-24">
          {/* 1. BRAND IDENTITY */}
          <div className="lg:col-span-4 space-y-6 md:space-y-8">
            <Link to="/" className="inline-block">
              <span className="text-3xl md:text-4xl font-black tracking-tighter text-black uppercase leading-none italic">
                KRUMEKU<span className="text-red-600">.</span>
              </span>
            </Link>
            <p className="leading-relaxed max-w-sm text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400 italic">
              Precision Crafted Indian Apparel. <br />
              Designed in Indore,{" "}
              <span className="text-black">Worn Everywhere.</span>
            </p>

            {/* Social Icons */}
            <div className="flex items-center gap-3 pt-2">
              {[
                { Icon: Instagram, link: "https://instagram.com/krumeku" },
                { Icon: Youtube, link: "https://youtube.com/@krumeku" },
                { Icon: Twitter, link: "https://twitter.com/krumeku" },
              ].map(({ Icon, link }, i) => (
                <a
                  key={i}
                  href={link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 flex items-center justify-center bg-white border border-zinc-200 hover:border-black hover:bg-black hover:text-white transition-all duration-500 rounded-full group shadow-sm"
                >
                  <Icon
                    size={16}
                    className="text-black group-hover:text-white transition-colors"
                  />
                </a>
              ))}
            </div>
          </div>

          {/* 2. DIRECTORY */}
          <div className="lg:col-span-2 lg:col-start-6">
            <h4 className="font-black text-black uppercase tracking-[0.2em] text-[11px] mb-6 md:mb-8 italic underline decoration-red-600 underline-offset-4">
              Shop
            </h4>
            <ul className="space-y-3 md:space-y-4">
              {[
                { name: "New Drops", path: "/products?newArrival=true" },
                {
                  name: "Embroidered Tees",
                  path: "/products?category=Embroidery",
                },
                { name: "Bleach Art", path: "/products?category=Bleach" },
                { name: "Best Sellers", path: "/products" },
                { name: "The Full Archive", path: "/products" },
              ].map((item) => (
                <li key={item.name}>
                  <Link to={item.path} className={linkStyle}>
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* 3. ASSISTANCE */}
          <div className="lg:col-span-2">
            <h4 className="font-black text-black uppercase tracking-[0.2em] text-[11px] mb-6 md:mb-8 italic underline decoration-red-600 underline-offset-4">
              Support
            </h4>
            <ul className="space-y-3 md:space-y-4">
              {[
                { name: "Track Order", path: "/orders" },
                { name: "Exchange & Returns", path: "/orders" },
                { name: "Size Guide", path: "/products" },
                { name: "Contact Us", path: "/profile" },
                { name: "Policies & Legal", path: "/policies" },
              ].map((item) => (
                <li key={item.name}>
                  <Link to={item.path} className={linkStyle}>
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* 4. NEWSLETTER & TRUST */}
          <div className="lg:col-span-3">
            <h4 className="font-black text-black uppercase tracking-[0.2em] text-[11px] mb-6 italic">
              Newsletter
            </h4>
            <p className="text-[10px] font-bold text-zinc-500 mb-6 uppercase tracking-widest leading-relaxed">
              Get <span className="text-black">10% OFF</span> on your first drop
              & early access to releases.
            </p>
            <form className="relative group mb-8">
              <input
                type="email"
                placeholder="EMAIL ADDRESS"
                className="w-full bg-white border border-zinc-200 rounded-lg py-3 px-4 text-[10px] font-black uppercase tracking-widest outline-none focus:border-black transition-all placeholder:text-zinc-300 shadow-sm"
              />
              <button
                type="button"
                aria-label="Subscribe"
                className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-zinc-400 hover:text-black transition-all active:scale-90"
              >
                <ArrowRight size={18} />
              </button>
            </form>

            <div className="flex flex-col gap-y-4">
              <div className="flex items-center gap-2 text-[9px] font-black uppercase tracking-widest text-zinc-400">
                <Globe size={14} className="text-black" />
                <span>Base: Indore</span>
              </div>
              <div className="flex items-center gap-2 text-[9px] font-black uppercase tracking-widest text-zinc-400">
                <ShieldCheck size={14} className="text-black" />
                <span>100% Premium Quality</span>
              </div>
              <div className="flex items-center gap-2 text-[9px] font-black uppercase tracking-widest text-zinc-400">
                <Scissors size={14} className="text-red-600" />
                <span className="text-black">In-House Embroidery</span>
              </div>
            </div>
          </div>
        </div>

        {/* FOOTER BOTTOM */}
        <div className="pt-8 border-t border-zinc-200 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex flex-col md:flex-row items-center gap-3 md:gap-6">
            <p className="text-[9px] font-black uppercase text-zinc-400 tracking-[0.2em] text-center">
              © {new Date().getFullYear()} KRUMEKU Archive. All Rights Reserved.
            </p>
            <span className="hidden md:block text-zinc-300">|</span>
            <Link
              to="/policies"
              className="text-[9px] font-black uppercase tracking-[0.2em] text-zinc-500 hover:text-black transition-colors"
            >
              Policies & Legal
            </Link>
          </div>

          <div className="flex items-center gap-6 opacity-40 hover:opacity-100 transition-opacity duration-700">
            <div className="flex items-center gap-3">
              <Smartphone size={16} />
              <CreditCard size={16} />
            </div>
            <div className="h-3 w-[1px] bg-zinc-300"></div>
            <span className="text-[8px] font-black uppercase tracking-[0.2em] italic">
              Secure Payment Gateways
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
