import React from "react";
import { Link } from "react-router-dom";
import {
  Facebook,
  Instagram,
  Twitter,
  ArrowRight,
  CreditCard,
  Smartphone,
  ShieldCheck,
  Globe,
  Youtube,
} from "lucide-react";

const Footer = () => {
  return (
    <footer className="bg-white border-t border-gray-100 text-gray-600 font-sans mt-auto selection:bg-black selection:text-white">
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
              Redefining Indian Streetwear. <br />
              Designed in Indore,{" "}
              <span className="text-black">Worn Everywhere.</span>
            </p>

            {/* Social Icons */}
            <div className="flex items-center gap-3 pt-2">
              {[
                { Icon: Instagram, link: "https://instagram.com" },
                { Icon: Youtube, link: "https://youtube.com" },
                { Icon: Twitter, link: "https://twitter.com" },
              ].map(({ Icon, link }, i) => (
                <a
                  key={i}
                  href={link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 flex items-center justify-center bg-zinc-50 border border-zinc-100 hover:border-black hover:bg-black hover:text-white transition-all duration-500 rounded-full group"
                >
                  <Icon className="w-4 h-4 text-black group-hover:text-white transition-colors" />
                </a>
              ))}
            </div>
          </div>

          {/* 2. DIRECTORY (Responsive Grid for Mobile) */}
          <div className="lg:col-span-2 lg:col-start-6">
            <h4 className="font-black text-black uppercase tracking-[0.2em] text-[11px] mb-6 md:mb-8 italic">
              Shop
            </h4>
            <ul className="space-y-3 md:space-y-4">
              {[
                { name: "New Drops", path: "/products" },
                { name: "Best Sellers", path: "/products" },
                { name: "Oversized", path: "/products" },
                { name: "Archive", path: "/products" },
              ].map((item) => (
                <li key={item.name}>
                  <Link
                    to={item.path}
                    className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 hover:text-black hover:pl-1 transition-all duration-300 block"
                  >
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* 3. ASSISTANCE */}
          <div className="lg:col-span-2">
            <h4 className="font-black text-black uppercase tracking-[0.2em] text-[11px] mb-6 md:mb-8 italic">
              Support
            </h4>
            <ul className="space-y-3 md:space-y-4">
              {[
                { name: "Track Order", path: "/orders" },
                { name: "Exchange & Returns", path: "/orders" },
                { name: "Size Guide", path: "/products" },
                { name: "Contact Us", path: "/profile" },
                // 🔥 NAYA LINK YAHAN ADD KIYA HAI
                { name: "Policies & Legal", path: "/policies" },
              ].map((item) => (
                <li key={item.name}>
                  <Link
                    to={item.path}
                    className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 hover:text-black hover:pl-1 transition-all duration-300 block"
                  >
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
            <p className="text-[10px] font-bold text-zinc-400 mb-6 uppercase tracking-widest leading-relaxed">
              Get <span className="text-black">10% OFF</span> on your first drop
              & early access to releases.
            </p>
            <form className="relative group mb-10">
              <input
                type="email"
                placeholder="EMAIL ADDRESS"
                className="w-full bg-zinc-50 border-b border-zinc-200 py-3 px-2 text-[10px] font-black uppercase tracking-widest outline-none focus:border-black transition-all placeholder:text-zinc-300"
              />
              <button
                type="button"
                className="absolute right-0 top-1/2 -translate-y-1/2 p-2 text-black hover:text-red-600 transition-all active:scale-90"
              >
                <ArrowRight className="w-5 h-5" />
              </button>
            </form>

            <div className="flex flex-wrap gap-x-6 gap-y-4">
              <div className="flex items-center gap-2 text-[9px] font-black uppercase tracking-widest text-zinc-300">
                <Globe size={14} className="text-black" />
                <span>Base: Indore</span>
              </div>
              <div className="flex items-center gap-2 text-[9px] font-black uppercase tracking-widest text-zinc-300">
                <ShieldCheck size={14} className="text-black" />
                <span>Authentic</span>
              </div>
            </div>
          </div>
        </div>

        {/* FOOTER BOTTOM */}
        <div className="pt-8 border-t border-zinc-100 flex flex-col md:flex-row items-center justify-between gap-6">
          {/* 🔥 SABSE NICHE COPYRIGHT KE SATH BHI LINK ADD KIYA HAI */}
          <div className="flex flex-col md:flex-row items-center gap-3 md:gap-6">
            <p className="text-[9px] font-black uppercase text-zinc-300 tracking-[0.2em] text-center">
              © {new Date().getFullYear()} KRUMEKU Archive. All Rights Reserved.
            </p>
            <span className="hidden md:block text-zinc-200">|</span>
            <Link
              to="/policies"
              className="text-[9px] font-black uppercase tracking-[0.2em] text-zinc-400 hover:text-black transition-colors"
            >
              Policies & Legal
            </Link>
          </div>

          <div className="flex items-center gap-6 opacity-30 hover:opacity-100 transition-opacity duration-700">
            <div className="flex items-center gap-2">
              <Smartphone size={14} />
              <CreditCard size={14} />
            </div>
            <div className="h-3 w-[1px] bg-zinc-200"></div>
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
