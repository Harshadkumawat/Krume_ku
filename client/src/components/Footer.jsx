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
} from "lucide-react";

const Footer = () => {
  return (
    <footer className="bg-white border-t border-gray-100 text-gray-600 font-sans mt-auto">
      <div className="max-w-[1600px] mx-auto px-6 md:px-12 pt-24 pb-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-16 lg:gap-8 mb-24">
          {/* 1. BRAND MANIFESTO */}
          <div className="lg:col-span-4 space-y-8">
            <div className="flex items-center gap-1">
              <span className="text-4xl font-black tracking-tighter text-black uppercase leading-none italic">
                KRUMEKU<span className="text-red-600">.</span>
              </span>
            </div>
            <p className="leading-relaxed max-w-sm text-[10px] font-bold uppercase tracking-widest text-gray-400 italic">
              Redefining Indian Streetwear. <br />
              Engineered in Indore,{" "}
              <span className="text-black">Worn Globally.</span>
            </p>

            {/* Social Icons */}
            <div className="flex items-center gap-3 pt-4">
              {[Instagram, Facebook, Twitter].map((Icon, i) => (
                <a
                  key={i}
                  href="#"
                  className="w-10 h-10 flex items-center justify-center bg-gray-50 border border-gray-100 hover:border-black hover:bg-black hover:text-white transition-all duration-300 group rounded-full"
                >
                  <Icon className="w-4 h-4 text-black group-hover:text-white" />
                </a>
              ))}
            </div>
          </div>

          {/* 2. DIRECTORY */}
          <div className="lg:col-span-2 lg:col-start-6">
            <h4 className="font-black text-black uppercase tracking-[0.2em] text-[11px] mb-8">
              Shop
            </h4>
            <ul className="space-y-4">
              {[
                { name: "New Arrivals", path: "/products" },
                { name: "Best Sellers", path: "/products" },
                { name: "Oversized Tees", path: "/products" },
                { name: "Anime Collection", path: "/products" },
              ].map((item) => (
                <li key={item.name}>
                  <Link
                    to={item.path}
                    className="text-[10px] font-bold uppercase tracking-widest text-gray-400 hover:text-black hover:pl-2 transition-all duration-300 block"
                  >
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* 3. ASSISTANCE */}
          <div className="lg:col-span-2">
            <h4 className="font-black text-black uppercase tracking-[0.2em] text-[11px] mb-8">
              Help
            </h4>
            <ul className="space-y-4">
              {[
                { name: "Track Order", path: "/orders" },
                { name: "Returns & Exchanges", path: "/returns" },
                { name: "Size Guide", path: "/size-guide" },
                { name: "Privacy Policy", path: "/privacy" },
              ].map((item) => (
                <li key={item.name}>
                  <Link
                    to={item.path}
                    className="text-[10px] font-bold uppercase tracking-widest text-gray-400 hover:text-black hover:pl-2 transition-all duration-300 block"
                  >
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* 4. NEWSLETTER */}
          <div className="lg:col-span-3">
            <h4 className="font-black text-black uppercase tracking-[0.2em] text-[11px] mb-6">
              Newsletter
            </h4>
            <p className="text-[10px] font-bold text-gray-400 mb-8 uppercase tracking-widest leading-relaxed">
              Get <span className="text-black">10% OFF</span> on your first
              order & early access to drops.
            </p>
            <form className="relative group">
              <input
                type="email"
                placeholder="EMAIL ADDRESS"
                className="w-full bg-gray-50 border-b-2 border-gray-100 py-3 px-2 text-[10px] font-bold uppercase tracking-widest outline-none focus:border-black transition-all placeholder:text-gray-300"
              />
              <button
                type="button"
                className="absolute right-0 top-1/2 -translate-y-1/2 p-2 text-black hover:text-red-600 transition-colors"
              >
                <ArrowRight className="w-5 h-5" />
              </button>
            </form>

            <div className="mt-12 space-y-4">
              <div className="flex items-center gap-4 text-[9px] font-bold uppercase tracking-widest text-gray-300">
                <Globe size={14} className="text-black" />
                <span>Base: Indore, India</span>
              </div>
              <div className="flex items-center gap-4 text-[9px] font-bold uppercase tracking-widest text-gray-300">
                <ShieldCheck size={14} className="text-black" />
                <span>100% Authentic</span>
              </div>
            </div>
          </div>
        </div>

        {/* FOOTER BOTTOM */}
        <div className="pt-10 border-t border-gray-100 flex flex-col md:flex-row items-center justify-between gap-6">
          <p className="text-[9px] font-bold uppercase text-gray-300 tracking-[0.2em]">
            © {new Date().getFullYear()} Krumeku. All Rights Reserved.
          </p>

          <div className="flex items-center gap-6 opacity-40 hover:opacity-100 transition-opacity duration-300">
            <Smartphone size={16} />
            <CreditCard size={16} />
            <div className="h-3 w-[1px] bg-gray-300"></div>
            <span className="text-[9px] font-bold uppercase tracking-widest italic">
              Secure Checkout
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
