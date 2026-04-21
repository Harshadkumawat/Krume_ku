import React, { useState, useEffect, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { saveShippingAddress } from "../features/cart/cartSlice";
import {
  fetchCurrentUser,
  updateUserAddress,
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
} from "lucide-react";
import SEO from "../components/SEO";
import Button from "../components/ui/Button";

// ─── Constants ────────────────────────────────────────────────────────────────

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

// ─── Stepper ──────────────────────────────────────────────────────────────────

const CheckoutStepper = () => (
  <div
    className="hidden md:flex justify-between items-center mb-10 px-10 max-w-xl mx-auto"
    aria-hidden="true"
  >
    <div className="flex flex-col items-center gap-2">
      <CheckCircle2 size={18} className="text-black" />
      <span className="text-[9px] font-black uppercase tracking-widest">
        Cart
      </span>
    </div>
    <div className="h-[2px] flex-1 bg-black mx-4" />
    <div className="flex flex-col items-center gap-2">
      <div className="w-5 h-5 rounded-full bg-black flex items-center justify-center text-white text-[9px] font-black italic">
        2
      </div>
      <span className="text-[9px] font-black uppercase tracking-widest">
        Shipping
      </span>
    </div>
    <div className="h-[2px] flex-1 bg-zinc-200 mx-4" />
    <div className="flex flex-col items-center gap-2">
      <div className="w-5 h-5 rounded-full border-2 border-zinc-200" />
      <span className="text-[9px] font-black uppercase tracking-widest text-zinc-400">
        Payment
      </span>
    </div>
  </div>
);

// ─── Main Component ───────────────────────────────────────────────────────────

export default function Shipping() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { shippingAddress } = useSelector((s) => s.cart);
  const { user, isLoading: userLoading } = useSelector((s) => s.auth);

  useEffect(() => {
    if (!user) dispatch(fetchCurrentUser());
  }, [dispatch, user]);

  const savedAddresses = user?.addresses || [];
  const defaultIndex = savedAddresses.findIndex((a) => a.isDefault) ?? 0;

  const [showForm, setShowForm] = useState(false);
  const [selectedAddressIndex, setSelectedAddressIndex] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editingAddressId, setEditingAddressId] = useState(null);
  const [form, setForm] = useState(() => pickFormFields(shippingAddress));
  const [isFetchingPin, setIsFetchingPin] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

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
  }, []);

  const handleAddNew = useCallback(() => {
    setForm(BLANK_FORM);
    setIsEditing(false);
    setEditingAddressId(null);
    setShowForm(true);
  }, []);

  const handlePincodeChange = async (e) => {
    const val = e.target.value.replace(/\D/g, "").slice(0, 6);
    setForm((p) => ({ ...p, pincode: val }));

    if (val.length === 6) {
      setIsFetchingPin(true);
      try {
        const res = await fetch(`https://api.postalpincode.in/pincode/${val}`);
        const data = await res.json();
        if (data[0].Status === "Success") {
          const po = data[0].PostOffice[0];
          setForm((p) => ({ ...p, city: po.District, state: po.State }));
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
    if (!form.fullName.trim() || form.fullName.trim().length < 2)
      return toast.error("Enter a valid full name.") && false;
    if (form.phone.length !== 10)
      return toast.error("Enter a valid 10-digit mobile number.") && false;
    if (form.pincode.length !== 6)
      return toast.error("Enter a valid 6-digit pincode.") && false;
    if (!form.city.trim()) return toast.error("City is required.") && false;
    if (!form.state) return toast.error("Please select a state.") && false;
    if (!form.address.trim() || form.address.trim().length < 5)
      return toast.error("Enter a complete delivery address.") && false;
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
      navigate("/placeorder"); // Move to Place Order
      return;
    }

    if (!validateForm()) return;

    if (isEditing && editingAddressId) {
      try {
        await dispatch(
          updateUserAddress({ id: editingAddressId, addressData: form }),
        ).unwrap();
        toast.success("Address updated!");
      } catch {
        toast.error("Could not save address update. Continuing anyway.");
      }
    }

    dispatch(saveShippingAddress({ ...form, country: "India" }));
    navigate("/placeorder"); // Move to Place Order
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
        : "Continue to Payment";

  return (
    <>
      <style>{`
        @keyframes ship-in {
          from { opacity: 0; transform: translateY(10px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .ship-page { animation: ship-in 0.35s cubic-bezier(0.33,1,0.68,1) both; }

        .addr-card {
          border: 1.5px solid #e4e4e7;
          transition: border-color 0.15s, box-shadow 0.15s;
          cursor: pointer;
        }
        .addr-card:hover { border-color: #a1a1aa; }
        .addr-card.selected {
          border-color: #000;
          box-shadow: 0 0 0 1px #000;
        }

        .ship-input {
          width: 100%; height: 48px; padding: 0 16px;
          background: #fafafa; border: 1.5px solid #e4e4e7;
          font-size: 13.5px; font-weight: 500; color: #18181b;
          transition: border-color 0.15s, background 0.15s;
          outline: none; border-radius: 0;
          appearance: none;
        }
        .ship-input::placeholder { color: #a1a1aa; }
        .ship-input:focus { border-color: #000; background: #fff; }
        .ship-input.icon-pad { padding-left: 44px; }
        .ship-input.autofilled { border-color: #86efac; background: #f0fdf4; }

        .type-btn {
          flex: 1; height: 44px; border: 1.5px solid #e4e4e7;
          display: flex; align-items: center; justify-content: center; gap: 8px;
          font-size: 11px; font-weight: 900; text-transform: uppercase;
          letter-spacing: 0.12em; transition: all 0.15s; cursor: pointer;
          background: white; color: #71717a; outline: none; border-radius: 0;
        }
        .type-btn:hover { border-color: #000; color: #000; }
        .type-btn.active { background: #000; border-color: #000; color: #fff; }
        .type-btn:focus-visible { box-shadow: 0 0 0 2px #000; }

        .ship-submit {
          width: 100%; height: 52px; background: #000; color: #fff;
          display: flex; align-items: center; justify-content: center; gap: 8px;
          font-size: 10.5px; font-weight: 900; text-transform: uppercase;
          letter-spacing: 0.2em; border: none; cursor: pointer;
          position: relative; overflow: hidden; transition: opacity 0.15s;
          border-radius: 0;
        }
        .ship-submit:hover { opacity: 0.88; }
        .ship-submit::after {
          content: '';
          position: absolute; top: 0; left: -80%; width: 50%; height: 100%;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.08), transparent);
          transition: left 0.55s ease; pointer-events: none;
        }
        .ship-submit:hover::after { left: 130%; }

        .edit-btn {
          position: absolute; top: 16px; right: 16px;
          width: 32px; height: 32px; border: 1.5px solid #e4e4e7;
          display: flex; align-items: center; justify-content: center;
          background: white; color: #a1a1aa; cursor: pointer;
          transition: all 0.15s; outline: none; border-radius: 0;
        }
        .edit-btn:hover { border-color: #000; color: #000; }
        @media (min-width: 768px) {
          .edit-btn { opacity: 0; }
          .addr-card:hover .edit-btn, .edit-btn:focus-visible { opacity: 1; }
        }

        .dropdown-item {
          padding: 10px 12px; font-size: 13px; cursor: pointer;
          transition: background 0.1s; outline: none;
        }
        .dropdown-item:hover, .dropdown-item:focus { background: #f4f4f5; }
        .dropdown-item.active { background: #000; color: #fff; font-weight: 700; }
      `}</style>

      <div className="min-h-screen bg-white md:bg-zinc-50 text-black pb-24 md:pb-0">
        <SEO
          title="Shipping"
          description="Provide your delivery details securely."
        />

        {/* Mobile top bar */}
        <div className="md:hidden flex items-center px-4 py-3.5 border-b border-zinc-100 sticky top-0 bg-white z-40">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="p-2 -ml-2 outline-none focus-visible:ring-2 focus-visible:ring-black"
            aria-label="Go back"
          >
            <ChevronLeft size={22} />
          </button>
          <h2 className="text-[11px] font-black uppercase tracking-[0.2em] ml-2">
            Delivery Details
          </h2>
        </div>

        <div className="max-w-[1440px] mx-auto px-4 md:px-6 lg:px-12 py-6 md:py-12">
          <div className="max-w-2xl mx-auto ship-page">
            <CheckoutStepper />

            {/* Card */}
            <div className="bg-white border border-zinc-200 md:shadow-sm p-6 md:p-10">
              {/* Header */}
              <div className="flex items-start justify-between mb-8 pb-5 border-b border-zinc-100">
                <div>
                  <h1 className="text-xl md:text-2xl font-black uppercase italic tracking-tight">
                    Delivery Details
                  </h1>
                  <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mt-1.5 flex items-center gap-1.5">
                    <Package size={11} className="text-black" />
                    Dispatched from our in-house workshop
                  </p>
                </div>

                {savedAddresses.length > 0 && (
                  <button
                    type="button"
                    onClick={() =>
                      showForm ? setShowForm(false) : handleAddNew()
                    }
                    className="text-[10px] font-black uppercase tracking-widest border-b-2 border-black pb-0.5 flex items-center gap-1.5 hover:opacity-60 transition-opacity outline-none focus-visible:ring-2 focus-visible:ring-black"
                  >
                    {showForm ? (
                      "Saved Addresses"
                    ) : (
                      <>
                        <Plus size={12} /> Add New
                      </>
                    )}
                  </button>
                )}
              </div>

              {/* ── Saved addresses list ── */}
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
                        className={`addr-card relative p-5 ${isSelected ? "selected" : ""}`}
                      >
                        <button
                          type="button"
                          aria-label={`Edit address for ${addr.fullName}`}
                          onClick={(e) => handleEditClick(e, addr)}
                          className="edit-btn"
                        >
                          <Edit2 size={13} />
                        </button>

                        <div className="flex items-center gap-2.5 mb-3">
                          <div
                            className={`w-6 h-6 flex items-center justify-center ${isSelected ? "bg-black text-white" : "bg-zinc-100 text-zinc-500"}`}
                          >
                            {addr.addressType === "Home" ? (
                              <Home size={13} />
                            ) : (
                              <Briefcase size={13} />
                            )}
                          </div>
                          <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400">
                            {addr.addressType}
                          </span>
                          {isSelected && (
                            <CheckCircle2
                              size={16}
                              className="text-black ml-auto"
                            />
                          )}
                        </div>

                        <p className="text-[14px] font-black uppercase tracking-tight mb-0.5">
                          {addr.fullName}
                        </p>
                        <p className="text-[12px] font-semibold text-zinc-500 mb-2.5">
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
                </div>
              ) : (
                /* ── Address form ── */
                <form
                  onSubmit={submitHandler}
                  className="grid grid-cols-1 md:grid-cols-2 gap-5 animate-in fade-in"
                  noValidate
                >
                  <div className="space-y-1.5">
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
                        className="ship-input icon-pad"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
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
                        className="ship-input icon-pad"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
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
                    </label>
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

                  <div className="space-y-1.5">
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
                      className={`ship-input${form.city ? " autofilled" : ""}`}
                    />
                  </div>

                  {/* State Dropdown */}
                  <div className="space-y-1.5 md:col-span-2 lg:col-span-1 relative">
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
                      className={`ship-input flex items-center justify-between cursor-pointer select-none${form.city ? " autofilled" : ""}`}
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
                        <div className="absolute top-[calc(100%+4px)] left-0 w-full bg-white border border-zinc-200 shadow-xl z-50 flex flex-col">
                          <div className="p-2 border-b border-zinc-100">
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
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full h-9 pl-9 pr-3 text-[13px] bg-zinc-50 border border-zinc-200 outline-none focus:border-black"
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
                              <li className="px-3 py-3 text-sm text-zinc-400 text-center">
                                No state found
                              </li>
                            )}
                          </ul>
                        </div>
                      </>
                    )}
                  </div>

                  <div className="space-y-1.5">
                    <label
                      htmlFor="landmark"
                      className="text-[10px] font-black uppercase tracking-[0.18em] text-zinc-400 block"
                    >
                      Landmark{" "}
                      <span className="font-medium normal-case tracking-normal">
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
                        className="ship-input icon-pad"
                      />
                    </div>
                  </div>

                  <div className="md:col-span-2 space-y-1.5">
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
                        className="ship-input icon-pad"
                      />
                    </div>
                  </div>

                  <div className="md:col-span-2 space-y-2">
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
                  <button
                    type="submit"
                    className="ship-submit hidden md:flex md:col-span-2 mt-4"
                  >
                    {ctaLabel}
                    <ArrowRight size={15} />
                  </button>
                </form>
              )}

              {/* Desktop CTA for saved-address view */}
              {!showForm && savedAddresses.length > 0 && (
                <button
                  type="button"
                  onClick={submitHandler}
                  className="ship-submit hidden md:flex mt-6"
                >
                  Deliver Here
                  <ArrowRight size={15} />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Mobile sticky CTA */}
      <div className="md:hidden fixed bottom-0 left-0 w-full bg-white border-t border-zinc-100 p-4 z-50">
        <button type="button" onClick={submitHandler} className="ship-submit">
          {ctaLabel}
          <ArrowRight size={15} />
        </button>
      </div>
    </>
  );
}
