import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  ArrowLeft,
  ShieldCheck,
  Truck,
  RefreshCcw,
  FileText,
} from "lucide-react";
import SEO from "../components/SEO";

export default function Policies() {
  const [activeTab, setActiveTab] = useState("refund");

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [activeTab]);

  const tabs = [
    { id: "refund", label: "Return & Refund", icon: RefreshCcw },
    { id: "shipping", label: "Shipping Policy", icon: Truck },
    { id: "privacy", label: "Privacy Policy", icon: ShieldCheck },
    { id: "terms", label: "Terms of Service", icon: FileText },
  ];

  const activeTabLabel =
    tabs.find((t) => t.id === activeTab)?.label || "Policies";

  return (
    <div className="min-h-screen bg-white pt-24 pb-20 selection:bg-black selection:text-white">
      <SEO
        title={activeTabLabel}
        description={`Read the KRUMEKU ${activeTabLabel}. We ensure transparency and premium service for all our acquisitions.`}
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
          <div className="flex-1 bg-zinc-50/30 p-6 md:p-10 rounded-3xl border border-zinc-100 min-h-[600px]">
            {/* 1. RETURN & REFUND POLICY */}
            {activeTab === "refund" && (
              <div className="space-y-6 text-sm text-zinc-600 leading-relaxed font-medium animate-in fade-in duration-500">
                <h2 className="text-2xl font-black text-black uppercase italic mb-6">
                  Return, Refund & Cancellation Policy
                </h2>
                <p>
                  At KRUMEKU, we are committed to maintaining the highest
                  standards of quality for our streetwear. We understand that
                  sometimes a product may not be the perfect fit. Please review
                  our comprehensive policy below.
                </p>

                <div className="space-y-2 mt-6">
                  <h3 className="text-sm font-black text-black uppercase tracking-widest">
                    1. Order Cancellation
                  </h3>
                  <ul className="list-disc pl-5 space-y-2">
                    <li>
                      <strong>Before Dispatch:</strong> Orders can be cancelled
                      completely free of charge before they are processed and
                      dispatched from our warehouse.
                    </li>
                    <li>
                      <strong>Prepaid Order Cancellations:</strong> If you
                      cancel a prepaid order prior to dispatch, a 100% refund
                      will be initiated to your original payment method.
                    </li>
                    <li>
                      <strong>Post Dispatch:</strong> Once an order is marked as
                      "Shipped" and handed over to our logistics partner, it
                      cannot be cancelled. You may refuse the delivery, but
                      shipping charges (if any) will not be refunded.
                    </li>
                  </ul>
                </div>

                <div className="space-y-2 mt-6">
                  <h3 className="text-sm font-black text-black uppercase tracking-widest">
                    2. Return & Exchange Eligibility
                  </h3>
                  <ul className="list-disc pl-5 space-y-2">
                    <li>
                      <strong>7-Day Window:</strong> You may raise a return or
                      exchange request within 7 calendar days of receiving your
                      order.
                    </li>
                    <li>
                      <strong>Condition of Item:</strong> To be eligible, the
                      item must be unworn, unwashed, unaltered, and in its exact
                      original condition with all KRUMEKU tags intact.
                    </li>
                    <li>
                      <strong>Quality Check (QC):</strong> Items returned with
                      makeup stains, deodorant marks, sweat odours, or any signs
                      of wear will be strictly rejected by our QC team and sent
                      back to the customer without a refund.
                    </li>
                  </ul>
                </div>

                <div className="space-y-2 mt-6">
                  <h3 className="text-sm font-black text-black uppercase tracking-widest">
                    3. The Refund Process
                  </h3>
                  <ul className="list-disc pl-5 space-y-2">
                    <li>
                      Upon receiving the returned item at our facility, it will
                      undergo a mandatory Quality Check (QC) taking 24-48 hours.
                    </li>
                    <li>
                      <strong>Prepaid Orders:</strong> Once approved, the refund
                      will be credited back to your original source account
                      (Credit Card/UPI/NetBanking) within{" "}
                      <strong>5-7 business days</strong>.
                    </li>
                    <li>
                      <strong>COD Orders:</strong> For Cash on Delivery orders,
                      a refund link will be sent to your registered email/phone
                      to collect your bank account details. The refund will be
                      processed via IMPS/NEFT within 5-7 business days
                      post-approval.
                    </li>
                  </ul>
                </div>
              </div>
            )}

            {/* 2. SHIPPING POLICY */}
            {activeTab === "shipping" && (
              <div className="space-y-6 text-sm text-zinc-600 leading-relaxed font-medium animate-in fade-in duration-500">
                <h2 className="text-2xl font-black text-black uppercase italic mb-6">
                  Shipping Policy
                </h2>
                <p>
                  We have partnered with top-tier logistics providers across
                  India to ensure your KRUMEKU pieces reach you safely and
                  swiftly.
                </p>

                <div className="space-y-2 mt-6">
                  <h3 className="text-sm font-black text-black uppercase tracking-widest">
                    1. Processing & Dispatch
                  </h3>
                  <ul className="list-disc pl-5 space-y-2">
                    <li>
                      All orders are verified, packed, and dispatched within{" "}
                      <strong>24 to 48 hours</strong> of order placement.
                    </li>
                    <li>
                      Orders placed on Sundays or National Holidays will be
                      processed on the next working day.
                    </li>
                    <li>
                      Once your order is dispatched, you will receive a tracking
                      ID via Email and SMS.
                    </li>
                  </ul>
                </div>

                <div className="space-y-2 mt-6">
                  <h3 className="text-sm font-black text-black uppercase tracking-widest">
                    2. Delivery Timelines
                  </h3>
                  <ul className="list-disc pl-5 space-y-2">
                    <li>
                      <strong>Metro Cities:</strong> 3 to 5 business days after
                      dispatch.
                    </li>
                    <li>
                      <strong>Tier 2/3 Cities & Rest of India:</strong> 5 to 7
                      business days after dispatch.
                    </li>
                    <li>
                      <em>
                        Note: Delivery times are estimates. Unforeseen
                        circumstances like extreme weather or logistical strikes
                        may cause slight delays.
                      </em>
                    </li>
                  </ul>
                </div>

                <div className="space-y-2 mt-6">
                  <h3 className="text-sm font-black text-black uppercase tracking-widest">
                    3. RTO (Return to Origin)
                  </h3>
                  <p>
                    If a delivery fails due to an incorrect address provided by
                    the customer, or if the customer is unreachable after 3
                    delivery attempts, the package will be returned to us (RTO).
                    In such cases of prepaid orders, a refund will be issued
                    after deducting a nominal forward and reverse shipping fee
                    of ₹150.
                  </p>
                </div>
              </div>
            )}

            {/* 3. PRIVACY POLICY */}
            {activeTab === "privacy" && (
              <div className="space-y-6 text-sm text-zinc-600 leading-relaxed font-medium animate-in fade-in duration-500">
                <h2 className="text-2xl font-black text-black uppercase italic mb-6">
                  Privacy Policy
                </h2>
                <p>
                  Your privacy is of utmost importance to KRUMEKU. This document
                  outlines how we collect, utilize, and protect your personal
                  data when you interact with our platform.
                </p>

                <div className="space-y-2 mt-6">
                  <h3 className="text-sm font-black text-black uppercase tracking-widest">
                    1. Data Collection
                  </h3>
                  <p>
                    We collect essential information required to fulfill your
                    orders, including your full name, shipping address, email
                    address, phone number, and IP address for fraud prevention.
                  </p>
                </div>

                <div className="space-y-2 mt-6">
                  <h3 className="text-sm font-black text-black uppercase tracking-widest">
                    2. Payment Security & Integrity
                  </h3>
                  <p>
                    All financial transactions are processed securely through
                    RBI-compliant, standard payment gateways (such as
                    Razorpay/Cashfree).{" "}
                    <strong>
                      KRUMEKU does not store your Credit/Debit card details or
                      UPI PINs on our servers.
                    </strong>{" "}
                    All connections are secured using 256-bit SSL encryption.
                  </p>
                </div>

                <div className="space-y-2 mt-6">
                  <h3 className="text-sm font-black text-black uppercase tracking-widest">
                    3. Third-Party Sharing
                  </h3>
                  <p>
                    We do not sell, trade, or rent your personal data to third
                    parties. We strictly share necessary logistical details
                    (Name, Address, Phone) with our trusted courier partners
                    (e.g., Delhivery, Bluedart) solely for the purpose of order
                    delivery.
                  </p>
                </div>

                <div className="space-y-2 mt-6">
                  <h3 className="text-sm font-black text-black uppercase tracking-widest">
                    4. Communication
                  </h3>
                  <p>
                    By creating an account or placing an order, you consent to
                    receiving transactional updates (Order Confirmation,
                    Tracking via WhatsApp/Email). You may opt out of promotional
                    marketing emails at any time.
                  </p>
                </div>
              </div>
            )}

            {/* 4. TERMS OF SERVICE */}
            {activeTab === "terms" && (
              <div className="space-y-6 text-sm text-zinc-600 leading-relaxed font-medium animate-in fade-in duration-500">
                <h2 className="text-2xl font-black text-black uppercase italic mb-6">
                  Terms of Service
                </h2>
                <p>
                  Welcome to KRUMEKU. By accessing our website and purchasing
                  our products, you agree to be bound by the following Terms and
                  Conditions.
                </p>

                <div className="space-y-2 mt-6">
                  <h3 className="text-sm font-black text-black uppercase tracking-widest">
                    1. General Overview
                  </h3>
                  <p>
                    We reserve the right to refuse service to anyone for any
                    reason at any time. You agree not to reproduce, duplicate,
                    copy, sell, or exploit any portion of the Service, the brand
                    identity, or products without express written permission by
                    us.
                  </p>
                </div>

                <div className="space-y-2 mt-6">
                  <h3 className="text-sm font-black text-black uppercase tracking-widest">
                    2. Product Accuracy
                  </h3>
                  <p>
                    We have made every effort to display the colors, textures,
                    and fits of our products as accurately as possible. However,
                    we cannot guarantee that your computer or mobile monitor's
                    display of any color will be 100% accurate.
                  </p>
                </div>

                <div className="space-y-2 mt-6">
                  <h3 className="text-sm font-black text-black uppercase tracking-widest">
                    3. Pricing & Modifications
                  </h3>
                  <p>
                    Prices for our products are subject to change without
                    notice. We reserve the right at any time to modify or
                    discontinue a product collection without prior notice. We
                    shall not be liable to you or any third-party for any
                    modification, price change, or suspension of a product.
                  </p>
                </div>

                <div className="space-y-2 mt-6">
                  <h3 className="text-sm font-black text-black uppercase tracking-widest">
                    4. Governing Law & Jurisdiction
                  </h3>
                  <p>
                    These Terms of Service and any separate agreements whereby
                    we provide you Services shall be governed by and construed
                    in accordance with the laws of India. Any disputes arising
                    from these terms shall be subject to the exclusive
                    jurisdiction of the courts located in India.
                  </p>
                </div>

                <div className="space-y-2 mt-6">
                  <h3 className="text-sm font-black text-black uppercase tracking-widest">
                    5. Contact Information
                  </h3>
                  <p>
                    For any legal or service-related queries, please write to us
                    at <strong>support@krumeku.com</strong>.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
