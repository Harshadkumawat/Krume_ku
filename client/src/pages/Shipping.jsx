import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { saveShippingAddress } from "../features/cart/cartSlice";
import {
  MapPin,
  Phone,
  ArrowRight,
  Landmark,
  Globe,
  CheckCircle2,
  ChevronLeft,
} from "lucide-react";

export default function Shipping() {
  const cart = useSelector((state) => state.cart);
  const { shippingAddress } = cart;

  const indianStates = [
    "Madhya Pradesh",
    "Maharashtra",
    "Delhi",
    "Uttar Pradesh",
    "Gujarat",
    "Rajasthan",
    "Karnataka",
    "Telangana",
    "Punjab",
    "Haryana",
    "Other",
  ];

  const [address, setAddress] = useState(shippingAddress.address || "");
  const [landmark, setLandmark] = useState(shippingAddress.landmark || "");
  const [city, setCity] = useState(shippingAddress.city || "");
  const [pincode, setPincode] = useState(shippingAddress.pincode || "");
  const [state, setState] = useState(shippingAddress.state || "Madhya Pradesh");
  const [phone, setPhone] = useState(shippingAddress.phone || "");

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const submitHandler = (e) => {
    e.preventDefault();
    dispatch(
      saveShippingAddress({
        address,
        landmark,
        city,
        pincode,
        state,
        country: "India",
        phone,
      }),
    );
    navigate("/placeorder");
  };

  return (
    <div className="min-h-screen bg-white md:bg-[#FAFAFA] text-black font-sans selection:bg-black selection:text-white">
      {/* --- MOBILE HEADER (Visible only on mobile) --- */}
      <div className="md:hidden flex items-center px-4 py-4 border-b border-gray-100 sticky top-0 bg-white z-50">
        <button onClick={() => navigate(-1)} className="p-2 -ml-2">
          <ChevronLeft size={24} />
        </button>
        <h2 className="text-sm font-black uppercase tracking-widest ml-2 italic">
          Shipping Details
        </h2>
      </div>

      <div className="max-w-[1440px] mx-auto px-4 md:px-6 lg:px-12 py-6 md:py-12">
        <div className="max-w-xl mx-auto">
          {/* --- STEPPER (Hidden on very small screens, visible on md+) --- */}
          <div className="hidden md:flex justify-between items-center mb-16">
            <div className="flex flex-col items-center gap-2">
              <CheckCircle2 size={16} className="text-zinc-300" />
              <span className="text-[8px] font-black uppercase tracking-widest text-zinc-400">
                Cart
              </span>
            </div>
            <div className="h-[1px] flex-1 bg-zinc-200 mx-4"></div>
            <div className="flex flex-col items-center gap-2">
              <div className="w-4 h-4 rounded-full bg-black flex items-center justify-center">
                <div className="w-1 h-1 bg-white rounded-full"></div>
              </div>
              <span className="text-[8px] font-black uppercase tracking-[0.2em] text-black italic">
                Shipping
              </span>
            </div>
            <div className="h-[1px] flex-1 bg-zinc-100 mx-4"></div>
            <div className="flex flex-col items-center gap-2">
              <div className="w-4 h-4 rounded-full border border-zinc-200"></div>
              <span className="text-[8px] font-black uppercase tracking-widest text-zinc-300">
                Payment
              </span>
            </div>
          </div>

          {/* --- MAIN FORM CONTAINER --- */}
          <div className="md:bg-white md:border md:border-zinc-100 md:rounded-[2.5rem] md:p-12 md:shadow-[0_40px_100px_-20px_rgba(0,0,0,0.04)]">
            <header className="mb-8 md:mb-10 hidden md:block">
              <h1 className="text-4xl font-black uppercase italic tracking-tighter leading-none mb-2">
                Deployment <br /> <span className="text-zinc-300">Address</span>
              </h1>
              <div className="flex items-center gap-2 opacity-40">
                <Globe size={10} />
                <span className="text-[9px] font-bold uppercase tracking-widest">
                  India Central Registry
                </span>
              </div>
            </header>

            <form
              onSubmit={submitHandler}
              className="space-y-6 md:space-y-7 pb-24 md:pb-0"
            >
              {/* Phone (Priority field for quick checkout) */}
              <div className="space-y-1.5">
                <label className="text-[9px] font-black uppercase tracking-widest text-zinc-400 ml-1">
                  Contact Protocol (+91)
                </label>
                <div className="relative group">
                  <Phone
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400 group-focus-within:text-black transition-colors"
                    size={16}
                  />
                  <input
                    type="tel"
                    required
                    maxLength={10}
                    placeholder="MOBILE NUMBER"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full h-14 md:h-16 pl-12 pr-4 bg-zinc-50 md:bg-zinc-50/50 border border-zinc-100 rounded-xl md:rounded-2xl text-[11px] font-bold uppercase italic focus:bg-white focus:border-black transition-all outline-none"
                  />
                </div>
              </div>

              {/* Address */}
              <div className="space-y-1.5">
                <label className="text-[9px] font-black uppercase tracking-widest text-zinc-400 ml-1">
                  Address Detail
                </label>
                <div className="relative group">
                  <MapPin
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400 group-focus-within:text-black transition-colors"
                    size={16}
                  />
                  <input
                    type="text"
                    required
                    placeholder="FLAT, HOUSE NO, BUILDING"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    className="w-full h-14 md:h-16 pl-12 pr-4 bg-zinc-50 border border-zinc-100 rounded-xl md:rounded-2xl text-[11px] font-bold uppercase italic focus:bg-white focus:border-black transition-all outline-none"
                  />
                </div>
              </div>

              {/* Landmark */}
              <div className="space-y-1.5">
                <label className="text-[9px] font-black uppercase tracking-widest text-zinc-400 ml-1">
                  Landmark
                </label>
                <div className="relative group">
                  <Landmark
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400 group-focus-within:text-black transition-colors"
                    size={16}
                  />
                  <input
                    type="text"
                    placeholder="NEARBY FAMOUS SPOT"
                    value={landmark}
                    onChange={(e) => setLandmark(e.target.value)}
                    className="w-full h-14 md:h-16 pl-12 pr-4 bg-zinc-50 border border-zinc-100 rounded-xl md:rounded-2xl text-[11px] font-bold uppercase italic focus:bg-white focus:border-black transition-all outline-none"
                  />
                </div>
              </div>

              {/* City & Pincode */}
              <div className="grid grid-cols-2 gap-3 md:gap-4">
                <div className="space-y-1.5">
                  <label className="text-[9px] font-black uppercase tracking-widest text-zinc-400 ml-1">
                    City
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="CITY"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="w-full h-14 md:h-16 px-5 bg-zinc-50 border border-zinc-100 rounded-xl md:rounded-2xl text-[11px] font-bold uppercase italic focus:bg-white focus:border-black transition-all outline-none"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[9px] font-black uppercase tracking-widest text-zinc-400 ml-1">
                    Pincode
                  </label>
                  <input
                    type="number"
                    required
                    placeholder="PINCODE"
                    value={pincode}
                    onChange={(e) => setPincode(e.target.value)}
                    className="w-full h-14 md:h-16 px-5 bg-zinc-50 border border-zinc-100 rounded-xl md:rounded-2xl text-[11px] font-bold uppercase italic focus:bg-white focus:border-black transition-all outline-none"
                  />
                </div>
              </div>

              {/* State */}
              <div className="space-y-1.5">
                <label className="text-[9px] font-black uppercase tracking-widest text-zinc-400 ml-1">
                  State Registry
                </label>
                <select
                  value={state}
                  onChange={(e) => setState(e.target.value)}
                  className="w-full h-14 md:h-16 px-5 bg-zinc-50 border border-zinc-100 rounded-xl md:rounded-2xl text-[11px] font-bold uppercase italic focus:bg-white focus:border-black outline-none appearance-none cursor-pointer"
                >
                  {indianStates.map((st) => (
                    <option key={st} value={st}>
                      {st}
                    </option>
                  ))}
                </select>
              </div>

              {/* --- DESKTOP BUTTON --- */}
              <button
                type="submit"
                className="hidden md:flex w-full bg-black text-white h-16 md:h-20 rounded-2xl font-black uppercase tracking-[0.3em] text-[11px] items-center justify-center gap-4 hover:bg-zinc-800 transition-all active:scale-95 shadow-xl mt-6"
              >
                Verify & Continue <ArrowRight size={18} />
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* --- MOBILE FIXED FOOTER BUTTON --- */}
      <div className="md:hidden fixed bottom-0 left-0 w-full bg-white border-t border-gray-100 p-4 z-50 shadow-[0_-10px_20px_rgba(0,0,0,0.05)]">
        <button
          onClick={submitHandler}
          className="w-full bg-black text-white h-14 rounded-xl font-black uppercase tracking-[0.2em] text-[10px] flex items-center justify-center gap-3 active:scale-95 transition-all"
        >
          Confirm Delivery Details <ArrowRight size={16} />
        </button>
      </div>
    </div>
  );
}
