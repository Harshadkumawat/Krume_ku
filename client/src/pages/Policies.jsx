import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  ArrowLeft,
  ShieldCheck,
  Truck,
  RefreshCcw,
  FileText,
} from "lucide-react";
import SEO from "../components/SEO"; // 🚀 SEO Import Added

export default function Policies() {
  const [activeTab, setActiveTab] = useState("refund");

  // Tab badalne par smooth scroll to top
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [activeTab]);

  const tabs = [
    { id: "refund", label: "Return & Refund", icon: RefreshCcw },
    { id: "shipping", label: "Shipping Policy", icon: Truck },
    { id: "privacy", label: "Privacy Policy", icon: ShieldCheck },
    { id: "terms", label: "Terms of Service", icon: FileText },
  ];

  // 🚀 SEO Dynamic Title Logic
  const activeTabLabel =
    tabs.find((t) => t.id === activeTab)?.label || "Policies";

  return (
    <div className="min-h-screen bg-white pt-24 pb-20 selection:bg-black selection:text-white">
      {/* 🚀 SEO Component - Changes title based on active tab */}
      <SEO
        title={activeTabLabel}
        description={`Read the Krumeku ${activeTabLabel}. We ensure transparency and premium service for all our acquisitions.`}
      />

      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] mb-10 text-zinc-400 hover:text-black transition-colors"
        >
          <ArrowLeft size={16} /> Back to Home
        </Link>

        <h1 className="text-4xl md:text-6xl font-black uppercase italic tracking-tighter mb-12">
          Legal <span className="text-zinc-300">& Policies</span>
        </h1>

        <div className="flex flex-col md:flex-row gap-10 md:gap-16 items-start">
          {/* SIDEBAR TABS */}
          <div className="w-full md:w-64 flex-shrink-0 flex flex-row md:flex-col gap-2 overflow-x-auto scrollbar-hide pb-4 md:pb-0 sticky top-28 z-10 bg-white">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-3 px-5 py-4 rounded-xl text-left whitespace-nowrap transition-all ${
                    isActive
                      ? "bg-black text-white shadow-xl scale-100"
                      : "bg-zinc-50 text-zinc-500 hover:bg-zinc-100 scale-95 hover:scale-100"
                  }`}
                >
                  <Icon
                    size={18}
                    className={isActive ? "text-white" : "text-zinc-400"}
                  />
                  <span className="text-[11px] font-black uppercase tracking-widest">
                    {tab.label}
                  </span>
                </button>
              );
            })}
          </div>

          {/* CONTENT SECTION */}
          <div className="flex-1 bg-zinc-50/50 p-6 md:p-10 rounded-3xl border border-zinc-100 min-h-[500px]">
            {activeTab === "refund" && (
              <div className="space-y-6 text-sm text-zinc-600 leading-relaxed font-medium animate-in fade-in duration-500">
                <h2 className="text-2xl font-black text-black uppercase italic mb-6">
                  Return & Refund Policy
                </h2>
                <p>
                  At KRUMEKU, we strive to ensure you are entirely satisfied
                  with your premium acquisitions. If you are not, we are here to
                  help.
                </p>
                <h3 className="text-sm font-black text-black uppercase tracking-widest pt-4">
                  1. Returns Window
                </h3>
                <p>
                  You have <strong>7 calendar days</strong> to return an item
                  from the date you received it. To be eligible for a return,
                  your item must be unused, unwashed, and in the same condition
                  that you received it.
                </p>
                <h3 className="text-sm font-black text-black uppercase tracking-widest pt-4">
                  2. Refunds Process
                </h3>
                <p>
                  Once we receive your item, our quality check (QC) team will
                  inspect it and notify you. If approved, we will initiate a
                  refund to your original method of payment.
                </p>
                <p>
                  Credit usually reflects within{" "}
                  <strong>5-7 working days</strong>.
                </p>
              </div>
            )}

            {activeTab === "shipping" && (
              <div className="space-y-6 text-sm text-zinc-600 leading-relaxed font-medium animate-in fade-in duration-500">
                <h2 className="text-2xl font-black text-black uppercase italic mb-6">
                  Shipping Policy
                </h2>
                <p>
                  We deliver premium streetwear across India using our trusted
                  logistics partners.
                </p>
                <h3 className="text-sm font-black text-black uppercase tracking-widest pt-4">
                  1. Processing Time
                </h3>
                <p>
                  All orders are processed within <strong>24-48 hours</strong>{" "}
                  (excluding weekends/holidays).
                </p>
                <h3 className="text-sm font-black text-black uppercase tracking-widest pt-4">
                  2. Delivery Estimates
                </h3>
                <p>
                  Standard delivery takes <strong>3 to 7 business days</strong>.
                  Metro cities usually receive orders within 3-4 days.
                </p>
              </div>
            )}

            {activeTab === "privacy" && (
              <div className="space-y-6 text-sm text-zinc-600 leading-relaxed font-medium animate-in fade-in duration-500">
                <h2 className="text-2xl font-black text-black uppercase italic mb-6">
                  Privacy Policy
                </h2>
                <p>
                  Your privacy is paramount. We collect info like Email, Name,
                  and Address strictly to fulfill your orders and improve
                  service.
                </p>
                <h3 className="text-sm font-black text-black uppercase tracking-widest pt-4">
                  1. Payment Security
                </h3>
                <p>
                  We use Razorpay. We do not store your card data. All
                  transactions are encrypted via PCI-DSS standards.
                </p>
              </div>
            )}

            {activeTab === "terms" && (
              <div className="space-y-6 text-sm text-zinc-600 leading-relaxed font-medium animate-in fade-in duration-500">
                <h2 className="text-2xl font-black text-black uppercase italic mb-6">
                  Terms of Service
                </h2>
                <p>
                  By using KRUMEKU, you agree to our terms. We reserve the right
                  to limit quantities and change pricing without notice.
                </p>
                <h3 className="text-sm font-black text-black uppercase tracking-widest pt-4">
                  1. Contact
                </h3>
                <p>
                  Questions? Reach us at <strong>support@krumeku.com</strong>.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
