import React, { useState, useEffect, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { saveShippingAddress } from "../features/cart/cartSlice";
import {
  fetchCurrentUser,
  updateUserAddress,
  addUserAddress,
} from "../features/auth/authSlice";
import { toast } from "react-toastify";
import {
  MapPin,
  Phone,
  Landmark,
  CheckCircle2,
  ChevronLeft,
  User as UserIcon,
  Home,
  Briefcase,
  Loader2,
  ChevronDown,
  Search,
  Plus,
  Edit2,
  Package,
  ArrowRight,
  Check,
} from "lucide-react";
import SEO from "../components/SEO";

// ─────────────────────────────────────────────────────────────────────────────
// Constants
// ─────────────────────────────────────────────────────────────────────────────

const INDIAN_STATES = [
  "Andhra Pradesh",
  "Arunachal Pradesh",
  "Assam",
  "Bihar",
  "Chhattisgarh",
  "Goa",
  "Gujarat",
  "Haryana",
  "Himachal Pradesh",
  "Jharkhand",
  "Karnataka",
  "Kerala",
  "Madhya Pradesh",
  "Maharashtra",
  "Manipur",
  "Meghalaya",
  "Mizoram",
  "Nagaland",
  "Odisha",
  "Punjab",
  "Rajasthan",
  "Sikkim",
  "Tamil Nadu",
  "Telangana",
  "Tripura",
  "Uttar Pradesh",
  "Uttarakhand",
  "West Bengal",
  "Delhi",
  "Chandigarh",
  "Ladakh",
  "Jammu & Kashmir",
  "Puducherry",
  "Other",
];

const ADDRESS_FORM_FIELDS = [
  "fullName",
  "phone",
  "pincode",
  "city",
  "state",
  "landmark",
  "address",
  "addressType",
];

const BLANK_FORM = {
  fullName: "",
  phone: "",
  pincode: "",
  city: "",
  state: "Maharashtra",
  landmark: "",
  address: "",
  addressType: "Home",
};

const pickFormFields = (addr = {}) =>
  ADDRESS_FORM_FIELDS.reduce((acc, k) => {
    acc[k] = addr[k] ?? BLANK_FORM[k];
    return acc;
  }, {});

// ─────────────────────────────────────────────────────────────────────────────
// Stepper
// ─────────────────────────────────────────────────────────────────────────────

const CheckoutStepper = () => (
  <div
    className="hidden md:flex justify-center items-center gap-0 mb-10"
    aria-hidden="true"
  >
    {/* Step 1 — Cart (done) */}
    <div className="flex flex-col items-center gap-2">
      <div className="w-8 h-8 rounded-full bg-black flex items-center justify-center">
        <Check size={14} className="text-white" strokeWidth={3} />
      </div>
      <span className="text-[9px] font-black uppercase tracking-widest text-black">
        Cart
      </span>
    </div>

    <div className="h-[2px] w-16 bg-black mb-5" />

    {/* Step 2 — Shipping (active) */}
    <div className="flex flex-col items-center gap-2">
      <div className="w-8 h-8 rounded-full bg-black flex items-center justify-center ring-4 ring-black/10">
        <span className="text-white text-[11px] font-black">2</span>
      </div>
      <span className="text-[9px] font-black uppercase tracking-widest text-black">
        Shipping
      </span>
    </div>

    <div className="h-[2px] w-16 bg-zinc-200 mb-5" />

    {/* Step 3 — Payment (inactive) */}
    <div className="flex flex-col items-center gap-2">
      <div className="w-8 h-8 rounded-full border-2 border-zinc-200 flex items-center justify-center">
        <span className="text-zinc-400 text-[11px] font-black">3</span>
      </div>
      <span className="text-[9px] font-black uppercase tracking-widest text-zinc-400">
        Payment
      </span>
    </div>
  </div>
);

// ─────────────────────────────────────────────────────────────────────────────
// Main Component
// ─────────────────────────────────────────────────────────────────────────────

export default function Shipping() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { shippingAddress } = useSelector((s) => s.cart);
  const { user, isLoading: userLoading } = useSelector((s) => s.auth);

  const savedAddresses = user?.addresses || [];

  const [showForm, setShowForm] = useState(false);
  const [selectedAddressIndex, setSelectedAddressIndex] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editingAddressId, setEditingAddressId] = useState(null);
  const [form, setForm] = useState(() => pickFormFields(shippingAddress));
  const [isFetchingPin, setIsFetchingPin] = useState(false);
  const [pinSuccess, setPinSuccess] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!user) dispatch(fetchCurrentUser());
  }, [dispatch, user]);

  useEffect(() => {
    if (user) {
      const addrs = user.addresses || [];
      if (addrs.length > 0) {
        const defIdx = addrs.findIndex((a) => a.isDefault);
        setSelectedAddressIndex(defIdx >= 0 ? defIdx : 0);
        setShowForm(false);
      } else {
        setShowForm(true);
        setSelectedAddressIndex(null);
      }
    }
  }, [user]);

  const filteredStates = INDIAN_STATES.filter((s) =>
    s.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const handleFormChange = useCallback((e) => {
    const { name, value } = e.target;
    setForm((p) => ({ ...p, [name]: value }));
  }, []);

  const handleEditClick = useCallback((e, addr) => {
    e.stopPropagation();
    setForm(pickFormFields(addr));
    setEditingAddressId(addr._id);
    setIsEditing(true);
    setShowForm(true);
    setPinSuccess(false);
  }, []);

  const handleAddNew = useCallback(() => {
    setForm(BLANK_FORM);
    setIsEditing(false);
    setEditingAddressId(null);
    setShowForm(true);
    setPinSuccess(false);
  }, []);

  const handlePincodeChange = async (e) => {
    const val = e.target.value.replace(/\D/g, "").slice(0, 6);
    setForm((p) => ({ ...p, pincode: val }));
    setPinSuccess(false);

    if (val.length === 6) {
      setIsFetchingPin(true);
      try {
        const res = await fetch(`https://api.postalpincode.in/pincode/${val}`);
        const data = await res.json();
        if (data[0].Status === "Success") {
          const po = data[0].PostOffice[0];
          setForm((p) => ({ ...p, city: po.District, state: po.State }));
          setPinSuccess(true);
          toast.success("City & State auto-filled!", { autoClose: 2000 });
        } else {
          toast.error("Invalid pincode — please check.");
          setForm((p) => ({ ...p, city: "", state: "Maharashtra" }));
        }
      } catch {
        toast.error("Couldn't fetch pincode details. Enter manually.");
      } finally {
        setIsFetchingPin(false);
      }
    }
  };

  const validateForm = () => {
    if (!form.fullName.trim() || form.fullName.trim().length < 2) {
      toast.error("Enter a valid full name.");
      return false;
    }
    if (form.phone.length !== 10) {
      toast.error("Enter a valid 10-digit mobile number.");
      return false;
    }
    if (form.pincode.length !== 6) {
      toast.error("Enter a valid 6-digit pincode.");
      return false;
    }
    if (!form.city.trim()) {
      toast.error("City is required.");
      return false;
    }
    if (!form.state) {
      toast.error("Please select a state.");
      return false;
    }
    if (!form.address.trim() || form.address.trim().length < 5) {
      toast.error("Enter a complete delivery address.");
      return false;
    }
    return true;
  };

  const submitHandler = async (e) => {
    if (e) e.preventDefault();

    if (!showForm && savedAddresses.length > 0) {
      if (selectedAddressIndex === null)
        return toast.error("Please select a delivery address.");
      const selected = savedAddresses[selectedAddressIndex];
      dispatch(
        saveShippingAddress({ ...pickFormFields(selected), country: "India" }),
      );
      navigate("/placeorder");
      return;
    }

    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      if (isEditing && editingAddressId) {
        await dispatch(
          updateUserAddress({ id: editingAddressId, addressData: form }),
        ).unwrap();
        toast.success("Address updated!");
      } else {
        await dispatch(addUserAddress(form)).unwrap();
        toast.success("Address saved!");
      }
    } catch {
      toast.error("Could not save address. Continuing anyway.");
    } finally {
      setIsSubmitting(false);
    }

    dispatch(saveShippingAddress({ ...form, country: "India" }));
    navigate("/placeorder");
  };

  if (userLoading && !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <Loader2 className="animate-spin text-black" size={36} />
        <span className="sr-only">Loading...</span>
      </div>
    );
  }

  const ctaLabel =
    !showForm && savedAddresses.length > 0
      ? "Deliver Here"
      : isEditing
        ? "Update & Continue"
        : "Save & Continue";

  return (
    <>
      <style>{`
        @keyframes ship-in {
          from { opacity: 0; transform: translateY(12px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .ship-page { animation: ship-in 0.4s cubic-bezier(0.33,1,0.68,1) both; }

        .addr-card {
          border: 1.5px solid #e4e4e7;
          border-radius: 14px;
          padding: 16px;
          cursor: pointer;
          transition: all 0.2s;
          position: relative;
          background: #fff;
        }
        .addr-card:hover { border-color: #a1a1aa; box-shadow: 0 2px 12px rgba(0,0,0,0.06); }
        .addr-card.selected {
          border-color: #000;
          box-shadow: 0 0 0 1.5px #000, 0 4px 16px rgba(0,0,0,0.08);
        }

        .ship-input {
          width: 100%;
          height: 48px;
          padding: 0 16px 0 44px;
          background: #fafafa;
          border: 1.5px solid #e4e4e7;
          border-radius: 10px;
          font-size: 13.5px;
          font-weight: 500;
          color: #18181b;
          outline: none;
          transition: all 0.15s;
          appearance: none;
        }
        .ship-input::placeholder { color: #a1a1aa; }
        .ship-input:focus {
          border-color: #000;
          background: #fff;
          box-shadow: 0 0 0 3px rgba(0,0,0,0.06);
        }
        .ship-input.no-icon { padding-left: 16px; }
        .ship-input.autofilled { border-color: #86efac; background: #f0fdf4; }

        .type-btn {
          flex: 1; height: 44px;
          border: 1.5px solid #e4e4e7;
          border-radius: 10px;
          display: flex; align-items: center; justify-content: center; gap: 7px;
          font-size: 11px; font-weight: 900; text-transform: uppercase;
          letter-spacing: 0.1em; cursor: pointer;
          background: white; color: #71717a;
          transition: all 0.15s; outline: none;
        }
        .type-btn:hover { border-color: #000; color: #000; }
        .type-btn.active { background: #000; border-color: #000; color: #fff; }

        .ship-submit {
          width: 100%; height: 52px;
          background: #000; color: #fff;
          border: none; border-radius: 12px;
          display: flex; align-items: center; justify-content: center; gap: 8px;
          font-size: 11px; font-weight: 900; text-transform: uppercase;
          letter-spacing: 0.2em; cursor: pointer;
          transition: opacity 0.15s, transform 0.1s;
        }
        .ship-submit:hover:not(:disabled) { opacity: 0.88; }
        .ship-submit:active:not(:disabled) { transform: scale(0.99); }
        .ship-submit:disabled { opacity: 0.5; cursor: not-allowed; }

        .edit-pill {
          position: absolute; top: 12px; right: 12px;
          display: flex; align-items: center; gap: 4px;
          background: #f4f4f5; border: none; border-radius: 8px;
          padding: 4px 10px; font-size: 10px; font-weight: 700;
          color: #71717a; cursor: pointer;
          transition: all 0.15s; outline: none;
          text-transform: uppercase; letter-spacing: 0.08em;
        }
        .edit-pill:hover { background: #000; color: #fff; }

        @media (min-width: 768px) {
          .edit-pill { opacity: 0; }
          .addr-card:hover .edit-pill,
          .edit-pill:focus-visible { opacity: 1; }
        }

        .dropdown-item {
          padding: 10px 14px; font-size: 13px; cursor: pointer;
          transition: background 0.1s; outline: none;
        }
        .dropdown-item:hover, .dropdown-item:focus { background: #f4f4f5; }
        .dropdown-item.active { background: #000; color: #fff; font-weight: 700; }

        .addr-type-badge {
          display: inline-flex; align-items: center; gap: 5px;
          padding: 3px 10px; border-radius: 8px;
          font-size: 10px; font-weight: 800; text-transform: uppercase;
          letter-spacing: 0.1em;
        }
        .addr-type-badge.selected { background: #000; color: #fff; }
        .addr-type-badge.default { background: #f4f4f5; color: #71717a; }
      `}</style>

      <div className="min-h-screen bg-zinc-50 text-black pb-28 md:pb-0">
        <SEO
          title="Shipping"
          description="Provide your delivery details securely."
        />

        {/* ── Mobile Top Bar ── */}
        <div className="md:hidden flex items-center px-4 py-4 border-b border-zinc-100 sticky top-0 bg-white/95 backdrop-blur-sm z-40">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="p-2 -ml-2 rounded-full hover:bg-zinc-100 transition-colors outline-none focus-visible:ring-2 focus-visible:ring-black"
            aria-label="Go back"
          >
            <ChevronLeft size={22} />
          </button>
          <div className="ml-3">
            <h2 className="text-[12px] font-black uppercase tracking-[0.2em]">
              Delivery Details
            </h2>
            <p className="text-[10px] text-zinc-400 font-medium mt-0.5">
              Step 2 of 3
            </p>
          </div>
        </div>

        <div className="max-w-[1440px] mx-auto px-4 md:px-6 lg:px-12 py-6 md:py-12">
          <div className="max-w-2xl mx-auto ship-page">
            <CheckoutStepper />

            {/* ── Main Card ── */}
            <div className="bg-white rounded-2xl border border-zinc-200 shadow-sm overflow-hidden">
              {/* Card Header */}
              <div className="px-6 md:px-10 py-5 border-b border-zinc-100 flex items-center justify-between">
                <div>
                  <h1 className="text-base font-black uppercase italic tracking-tight flex items-center gap-2">
                    <Package size={16} className="text-black" />
                    Delivery Details
                  </h1>
                  <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mt-1">
                    Dispatched from our in-house workshop
                  </p>
                </div>

                {savedAddresses.length > 0 && (
                  <button
                    type="button"
                    onClick={() =>
                      showForm ? setShowForm(false) : handleAddNew()
                    }
                    className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest bg-zinc-900 text-white px-3 py-2 rounded-lg hover:bg-zinc-700 transition-colors outline-none focus-visible:ring-2 focus-visible:ring-black"
                  >
                    {showForm ? (
                      "← Saved"
                    ) : (
                      <>
                        <Plus size={11} /> Add New
                      </>
                    )}
                  </button>
                )}
              </div>

              <div className="px-6 md:px-10 py-6">
                {/* ── Saved Addresses ── */}
                {!showForm && savedAddresses.length > 0 ? (
                  <div
                    className="space-y-3 animate-in fade-in"
                    role="radiogroup"
                    aria-label="Select delivery address"
                  >
                    {savedAddresses.map((addr, index) => {
                      const isSelected = selectedAddressIndex === index;
                      return (
                        <div
                          key={addr._id || index}
                          role="radio"
                          aria-checked={isSelected}
                          tabIndex={0}
                          onClick={() => setSelectedAddressIndex(index)}
                          onKeyDown={(e) =>
                            e.key === "Enter" && setSelectedAddressIndex(index)
                          }
                          className={`addr-card ${isSelected ? "selected" : ""}`}
                        >
                          {/* Edit pill */}
                          <button
                            type="button"
                            aria-label={`Edit address for ${addr.fullName}`}
                            onClick={(e) => handleEditClick(e, addr)}
                            className="edit-pill"
                          >
                            <Edit2 size={10} /> Edit
                          </button>

                          {/* Badge row */}
                          <div className="flex items-center gap-2.5 mb-3">
                            <span
                              className={`addr-type-badge ${isSelected ? "selected" : "default"}`}
                            >
                              {addr.addressType === "Home" ? (
                                <Home size={11} />
                              ) : (
                                <Briefcase size={11} />
                              )}
                              {addr.addressType}
                            </span>
                            {isSelected && (
                              <span className="ml-auto flex items-center gap-1 text-[10px] font-black text-black uppercase tracking-widest">
                                <CheckCircle2 size={15} /> Selected
                              </span>
                            )}
                          </div>

                          <p className="text-[14px] font-black uppercase tracking-tight mb-0.5">
                            {addr.fullName}
                          </p>
                          <p className="text-[12px] font-semibold text-zinc-500 mb-2">
                            +91 {addr.phone}
                          </p>
                          <p className="text-[12px] text-zinc-600 leading-relaxed">
                            {addr.address}
                            {addr.landmark && <>, near {addr.landmark}</>}
                          </p>
                          <p className="text-[12px] font-black text-zinc-800 mt-1 uppercase">
                            {addr.city}, {addr.state} — {addr.pincode}
                          </p>
                        </div>
                      );
                    })}

                    <div className="pt-2">
                      <button
                        type="button"
                        onClick={submitHandler}
                        disabled={isSubmitting}
                        className="ship-submit"
                      >
                        Deliver Here <ArrowRight size={16} />
                      </button>
                    </div>
                  </div>
                ) : (
                  /* ── Address Form ── */
                  <form
                    onSubmit={submitHandler}
                    className="grid grid-cols-1 md:grid-cols-2 gap-5 animate-in fade-in"
                    noValidate
                  >
                    {/* Full Name */}
                    <div className="space-y-2">
                      <label
                        htmlFor="fullName"
                        className="text-[10px] font-black uppercase tracking-[0.18em] text-zinc-400 block"
                      >
                        Full Name
                      </label>
                      <div className="relative">
                        <UserIcon
                          size={15}
                          className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400 pointer-events-none"
                        />
                        <input
                          id="fullName"
                          name="fullName"
                          type="text"
                          required
                          autoComplete="name"
                          placeholder="Recipient's full name"
                          value={form.fullName}
                          onChange={handleFormChange}
                          className="ship-input"
                        />
                      </div>
                    </div>

                    {/* Phone */}
                    <div className="space-y-2">
                      <label
                        htmlFor="phone"
                        className="text-[10px] font-black uppercase tracking-[0.18em] text-zinc-400 block"
                      >
                        Mobile Number
                      </label>
                      <div className="relative">
                        <Phone
                          size={15}
                          className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400 pointer-events-none"
                        />
                        <input
                          id="phone"
                          type="tel"
                          inputMode="numeric"
                          maxLength={10}
                          required
                          autoComplete="tel"
                          placeholder="10-digit number"
                          value={form.phone}
                          onChange={(e) =>
                            setForm((p) => ({
                              ...p,
                              phone: e.target.value.replace(/\D/g, ""),
                            }))
                          }
                          className="ship-input"
                        />
                      </div>
                    </div>

                    {/* Pincode */}
                    <div className="space-y-2">
                      <label
                        htmlFor="pincode"
                        className="text-[10px] font-black uppercase tracking-[0.18em] text-zinc-400 flex items-center gap-2"
                      >
                        Pincode
                        {isFetchingPin && (
                          <span
                            className="flex items-center gap-1 text-zinc-400 normal-case font-medium text-[10px]"
                            aria-live="polite"
                          >
                            <Loader2 size={10} className="animate-spin" />{" "}
                            Fetching...
                          </span>
                        )}
                        {pinSuccess && !isFetchingPin && (
                          <span className="flex items-center gap-1 text-emerald-500 normal-case font-bold text-[10px]">
                            <Check size={10} strokeWidth={3} /> Auto-filled
                          </span>
                        )}
                      </label>
                      <div className="relative">
                        <MapPin
                          size={15}
                          className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400 pointer-events-none"
                        />
                        <input
                          id="pincode"
                          type="tel"
                          inputMode="numeric"
                          maxLength={6}
                          required
                          placeholder="6-digit pincode"
                          value={form.pincode}
                          onChange={handlePincodeChange}
                          className="ship-input"
                        />
                      </div>
                    </div>

                    {/* City */}
                    <div className="space-y-2">
                      <label
                        htmlFor="city"
                        className="text-[10px] font-black uppercase tracking-[0.18em] text-zinc-400 block"
                      >
                        City / District
                      </label>
                      <input
                        id="city"
                        name="city"
                        type="text"
                        required
                        placeholder="City"
                        value={form.city}
                        onChange={handleFormChange}
                        className={`ship-input no-icon${form.city && pinSuccess ? " autofilled" : ""}`}
                      />
                    </div>

                    {/* State Dropdown */}
                    <div className="space-y-2 md:col-span-2 lg:col-span-1 relative">
                      <label
                        id="state-label"
                        className="text-[10px] font-black uppercase tracking-[0.18em] text-zinc-400 block"
                      >
                        State
                      </label>
                      <div
                        role="combobox"
                        aria-expanded={isDropdownOpen}
                        aria-controls="state-listbox"
                        aria-labelledby="state-label"
                        tabIndex={0}
                        onClick={() => setIsDropdownOpen(true)}
                        onKeyDown={(e) =>
                          e.key === "Enter" && setIsDropdownOpen(true)
                        }
                        className={`ship-input no-icon flex items-center justify-between cursor-pointer select-none${form.city && pinSuccess ? " autofilled" : ""}`}
                      >
                        <span
                          className={
                            form.state ? "text-zinc-900" : "text-zinc-400"
                          }
                        >
                          {form.state || "Select state"}
                        </span>
                        <ChevronDown
                          size={14}
                          className={`text-zinc-400 transition-transform ${isDropdownOpen ? "rotate-180" : ""}`}
                        />
                      </div>

                      {isDropdownOpen && (
                        <>
                          <div
                            className="fixed inset-0 z-40"
                            onClick={() => setIsDropdownOpen(false)}
                            aria-hidden="true"
                          />
                          <div className="absolute top-[calc(100%+4px)] left-0 w-full bg-white border border-zinc-200 rounded-xl shadow-xl z-50 flex flex-col overflow-hidden">
                            <div className="p-2.5 border-b border-zinc-100">
                              <div className="relative">
                                <Search
                                  size={13}
                                  className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400"
                                />
                                <input
                                  autoFocus
                                  type="text"
                                  aria-label="Search states"
                                  placeholder="Search state..."
                                  value={searchQuery}
                                  onChange={(e) =>
                                    setSearchQuery(e.target.value)
                                  }
                                  className="w-full h-9 pl-9 pr-3 text-[13px] bg-zinc-50 border border-zinc-200 rounded-lg outline-none focus:border-black transition-colors"
                                />
                              </div>
                            </div>
                            <ul
                              id="state-listbox"
                              role="listbox"
                              className="max-h-48 overflow-y-auto"
                            >
                              {filteredStates.length > 0 ? (
                                filteredStates.map((st) => (
                                  <li
                                    key={st}
                                    role="option"
                                    tabIndex={0}
                                    aria-selected={form.state === st}
                                    onClick={() => {
                                      setForm((p) => ({ ...p, state: st }));
                                      setIsDropdownOpen(false);
                                      setSearchQuery("");
                                    }}
                                    className={`dropdown-item ${form.state === st ? "active" : ""}`}
                                  >
                                    {st}
                                  </li>
                                ))
                              ) : (
                                <li className="px-3 py-4 text-sm text-zinc-400 text-center">
                                  No state found
                                </li>
                              )}
                            </ul>
                          </div>
                        </>
                      )}
                    </div>

                    {/* Landmark */}
                    <div className="space-y-2">
                      <label
                        htmlFor="landmark"
                        className="text-[10px] font-black uppercase tracking-[0.18em] text-zinc-400 block"
                      >
                        Landmark{" "}
                        <span className="font-medium normal-case tracking-normal text-zinc-300">
                          (optional)
                        </span>
                      </label>
                      <div className="relative">
                        <Landmark
                          size={15}
                          className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400 pointer-events-none"
                        />
                        <input
                          id="landmark"
                          name="landmark"
                          type="text"
                          placeholder="Near a famous place"
                          value={form.landmark}
                          onChange={handleFormChange}
                          className="ship-input"
                        />
                      </div>
                    </div>

                    {/* Address */}
                    <div className="md:col-span-2 space-y-2">
                      <label
                        htmlFor="address"
                        className="text-[10px] font-black uppercase tracking-[0.18em] text-zinc-400 block"
                      >
                        Flat / House No / Building / Street
                      </label>
                      <div className="relative">
                        <MapPin
                          size={15}
                          className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400 pointer-events-none"
                        />
                        <input
                          id="address"
                          name="address"
                          type="text"
                          required
                          autoComplete="street-address"
                          placeholder="Complete delivery address"
                          value={form.address}
                          onChange={handleFormChange}
                          className="ship-input"
                        />
                      </div>
                    </div>

                    {/* Address Type */}
                    <div className="md:col-span-2 space-y-2.5">
                      <p className="text-[10px] font-black uppercase tracking-[0.18em] text-zinc-400">
                        Save Address As
                      </p>
                      <div
                        className="flex gap-3"
                        role="group"
                        aria-label="Address type"
                      >
                        <button
                          type="button"
                          aria-pressed={form.addressType === "Home"}
                          onClick={() =>
                            setForm((p) => ({ ...p, addressType: "Home" }))
                          }
                          className={`type-btn ${form.addressType === "Home" ? "active" : ""}`}
                        >
                          <Home size={14} /> Home
                        </button>
                        <button
                          type="button"
                          aria-pressed={form.addressType === "Work"}
                          onClick={() =>
                            setForm((p) => ({ ...p, addressType: "Work" }))
                          }
                          className={`type-btn ${form.addressType === "Work" ? "active" : ""}`}
                        >
                          <Briefcase size={14} /> Work
                        </button>
                      </div>
                    </div>

                    {/* Desktop CTA */}
                    <div className="md:col-span-2 pt-2">
                      <button
                        type="submit"
                        disabled={isSubmitting}
                        className="ship-submit"
                      >
                        {isSubmitting ? (
                          <>
                            <Loader2 size={16} className="animate-spin" />{" "}
                            Saving...
                          </>
                        ) : (
                          <>
                            {ctaLabel} <ArrowRight size={16} />
                          </>
                        )}
                      </button>
                    </div>
                  </form>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Mobile Sticky CTA ── */}
      <div className="md:hidden fixed bottom-0 left-0 w-full bg-white/95 backdrop-blur-sm border-t border-zinc-100 px-4 py-4 z-50">
        <button
          type="button"
          onClick={submitHandler}
          disabled={isSubmitting}
          className="ship-submit"
        >
          {isSubmitting ? (
            <>
              <Loader2 size={16} className="animate-spin" /> Saving...
            </>
          ) : (
            <>
              {ctaLabel} <ArrowRight size={16} />
            </>
          )}
        </button>
      </div>
    </>
  );
}
