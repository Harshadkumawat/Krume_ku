import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  ArrowLeft,
  ShieldCheck,
  Truck,
  RefreshCcw,
  FileText,
} from "lucide-react";

export default function Policies() {
  const [activeTab, setActiveTab] = useState("refund");

  // Jab tab change ho, top par scroll kare
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [activeTab]);

  const tabs = [
    { id: "refund", label: "Return & Refund", icon: RefreshCcw },
    { id: "shipping", label: "Shipping Policy", icon: Truck },
    { id: "privacy", label: "Privacy Policy", icon: ShieldCheck },
    { id: "terms", label: "Terms of Service", icon: FileText },
  ];

  return (
    <div className="min-h-screen bg-white pt-24 pb-20 selection:bg-black selection:text-white">
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
          <div className="w-full md:w-64 flex-shrink-0 flex flex-row md:flex-col gap-2 overflow-x-auto scrollbar-hide pb-4 md:pb-0 sticky top-28">
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
          <div className="flex-1 bg-zinc-50/50 p-6 md:p-10 rounded-3xl border border-zinc-100">
            {activeTab === "refund" && (
              <div className="space-y-6 text-sm text-zinc-600 leading-relaxed font-medium">
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
                  that you received it. Your item must be in the original
                  packaging with all tags attached.
                </p>

                <h3 className="text-sm font-black text-black uppercase tracking-widest pt-4">
                  2. Refunds Process
                </h3>
                <p>
                  Once we receive your item, our quality check (QC) team will
                  inspect it and notify you. If your return is approved, we will
                  initiate a refund to your original method of payment (or Bank
                  Account/UPI for COD orders).
                </p>
                <p>
                  You will receive the credit within{" "}
                  <strong>5-7 working days</strong>, depending on your card
                  issuer's policies.
                </p>

                <h3 className="text-sm font-black text-black uppercase tracking-widest pt-4">
                  3. Non-Returnable Items
                </h3>
                <p>
                  Certain items such as limited-edition drops, accessories, or
                  items marked as "Final Sale" cannot be returned or exchanged
                  unless there is a manufacturing defect.
                </p>
              </div>
            )}

            {activeTab === "shipping" && (
              <div className="space-y-6 text-sm text-zinc-600 leading-relaxed font-medium">
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
                  (excluding weekends and holidays) after receiving your order
                  confirmation email. You will receive another notification when
                  your order has shipped.
                </p>

                <h3 className="text-sm font-black text-black uppercase tracking-widest pt-4">
                  2. Delivery Estimates
                </h3>
                <p>
                  Standard delivery takes <strong>3 to 7 business days</strong>{" "}
                  depending on your location. Metro cities usually receive
                  orders within 3-4 days, while tier 2/3 cities may take up to 7
                  days.
                </p>

                <h3 className="text-sm font-black text-black uppercase tracking-widest pt-4">
                  3. Shipping Charges
                </h3>
                <p>
                  Shipping charges for your order will be calculated and
                  displayed at checkout. We occasionally offer Free Shipping on
                  orders above a certain value.
                </p>
              </div>
            )}

            {activeTab === "privacy" && (
              <div className="space-y-6 text-sm text-zinc-600 leading-relaxed font-medium">
                <h2 className="text-2xl font-black text-black uppercase italic mb-6">
                  Privacy Policy
                </h2>
                <p>
                  KRUMEKU operates this website. This page informs you of our
                  policies regarding the collection, use, and disclosure of
                  personal data when you use our Service.
                </p>

                <h3 className="text-sm font-black text-black uppercase tracking-widest pt-4">
                  1. Information Collection
                </h3>
                <p>
                  We collect several different types of information for various
                  purposes to provide and improve our Service to you, including
                  Email address, First name and last name, Phone number, and
                  Address.
                </p>

                <h3 className="text-sm font-black text-black uppercase tracking-widest pt-4">
                  2. Payment Security
                </h3>
                <p>
                  We use Razorpay for processing payments. We/Razorpay do not
                  store your card data on their servers. The data is encrypted
                  through the Payment Card Industry Data Security Standard
                  (PCI-DSS) when processing payment.
                </p>

                <h3 className="text-sm font-black text-black uppercase tracking-widest pt-4">
                  3. Data Usage
                </h3>
                <p>
                  Your data is used strictly to fulfill your orders, provide
                  customer support, and send you important updates about your
                  purchases.
                </p>
              </div>
            )}

            {activeTab === "terms" && (
              <div className="space-y-6 text-sm text-zinc-600 leading-relaxed font-medium">
                <h2 className="text-2xl font-black text-black uppercase italic mb-6">
                  Terms of Service
                </h2>
                <p>
                  Please read these Terms of Service carefully before using the
                  KRUMEKU website.
                </p>

                <h3 className="text-sm font-black text-black uppercase tracking-widest pt-4">
                  1. Acceptance of Terms
                </h3>
                <p>
                  By accessing or using the Service, you agree to be bound by
                  these Terms. If you disagree with any part of the terms, then
                  you may not access the Service.
                </p>

                <h3 className="text-sm font-black text-black uppercase tracking-widest pt-4">
                  2. Products & Pricing
                </h3>
                <p>
                  All products are subject to availability, and we reserve the
                  right to impose quantity limits on any order. Prices for our
                  products are subject to change without notice.
                </p>

                <h3 className="text-sm font-black text-black uppercase tracking-widest pt-4">
                  3. Contact Us
                </h3>
                <p>
                  If you have any questions about these Terms, please contact us
                  at <strong>support@krumeku.com</strong>.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
