import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { saveShippingAddress } from "../features/cart/cartSlice";
import {
  MapPin,
  Phone,
  ArrowRight,
  Landmark,
  CheckCircle2,
  ChevronLeft,
} from "lucide-react";

export default function Shipping() {
  const cart = useSelector((state) => state.cart);
  const { shippingAddress } = cart;

  const indianStates = [
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

  const [address, setAddress] = useState(shippingAddress.address || "");
  const [landmark, setLandmark] = useState(shippingAddress.landmark || "");
  const [city, setCity] = useState(shippingAddress.city || "");
  const [pincode, setPincode] = useState(shippingAddress.pincode || "");
  const [state, setState] = useState(shippingAddress.state || "Maharashtra");
  const [phone, setPhone] = useState(shippingAddress.phone || "");

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const submitHandler = (e) => {
    e.preventDefault();
    // Indian Phone Validation
    if (phone.length < 10) {
      return alert("Please enter a valid 10-digit mobile number.");
    }

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
    <div className="min-h-screen bg-white md:bg-[#FAFAFA] text-black font-sans pb-24 md:pb-0">
      {/* Mobile Header */}
      <div className="md:hidden flex items-center px-4 py-4 border-b border-gray-100 sticky top-0 bg-white z-50">
        <button onClick={() => navigate(-1)} className="p-2 -ml-2">
          <ChevronLeft size={24} />
        </button>
        <h2 className="text-sm font-bold uppercase tracking-widest ml-2">
          Shipping Details
        </h2>
      </div>

      <div className="max-w-[1440px] mx-auto px-4 md:px-6 lg:px-12 py-6 md:py-12">
        <div className="max-w-xl mx-auto">
          {/* Desktop Stepper */}
          <div className="hidden md:flex justify-between items-center mb-12">
            <div className="flex flex-col items-center gap-2">
              <CheckCircle2 size={20} className="text-black" />
              <span className="text-[10px] font-bold uppercase tracking-widest">
                Cart
              </span>
            </div>
            <div className="h-[2px] flex-1 bg-black mx-4"></div>
            <div className="flex flex-col items-center gap-2">
              <div className="w-5 h-5 rounded-full bg-black flex items-center justify-center text-white text-[10px]">
                2
              </div>
              <span className="text-[10px] font-bold uppercase tracking-widest">
                Shipping
              </span>
            </div>
            <div className="h-[2px] flex-1 bg-gray-200 mx-4"></div>
            <div className="flex flex-col items-center gap-2">
              <div className="w-5 h-5 rounded-full border-2 border-gray-200"></div>
              <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400">
                Payment
              </span>
            </div>
          </div>

          <div className="md:bg-white md:border md:border-zinc-100 md:rounded-3xl md:p-10 md:shadow-lg">
            <h1 className="text-2xl md:text-3xl font-black uppercase italic mb-8 hidden md:block">
              Delivery Address
            </h1>

            <form onSubmit={submitHandler} className="space-y-5">
              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase tracking-widest text-gray-500 ml-1">
                  Mobile Number (+91)
                </label>
                <div className="relative">
                  <Phone
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                    size={16}
                  />
                  <input
                    type="tel"
                    required
                    maxLength={10}
                    placeholder="10-digit number"
                    value={phone}
                    onChange={(e) =>
                      setPhone(e.target.value.replace(/\D/g, ""))
                    }
                    className="w-full h-12 md:h-14 pl-12 pr-4 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium focus:border-black focus:bg-white outline-none transition-all"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase tracking-widest text-gray-500 ml-1">
                  Flat / House No / Building
                </label>
                <div className="relative">
                  <MapPin
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                    size={16}
                  />
                  <input
                    type="text"
                    required
                    placeholder="Address"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    className="w-full h-12 md:h-14 pl-12 pr-4 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium focus:border-black focus:bg-white outline-none transition-all"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase tracking-widest text-gray-500 ml-1">
                  Landmark (Optional)
                </label>
                <div className="relative">
                  <Landmark
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                    size={16}
                  />
                  <input
                    type="text"
                    placeholder="Near Famous Place"
                    value={landmark}
                    onChange={(e) => setLandmark(e.target.value)}
                    className="w-full h-12 md:h-14 pl-12 pr-4 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium focus:border-black focus:bg-white outline-none transition-all"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-gray-500 ml-1">
                    City
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="City"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="w-full h-12 md:h-14 px-4 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium focus:border-black focus:bg-white outline-none transition-all"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-gray-500 ml-1">
                    Pincode
                  </label>
                  <input
                    type="number"
                    required
                    placeholder="Pincode"
                    value={pincode}
                    onChange={(e) => setPincode(e.target.value)}
                    className="w-full h-12 md:h-14 px-4 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium focus:border-black focus:bg-white outline-none transition-all"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase tracking-widest text-gray-500 ml-1">
                  State
                </label>
                <select
                  value={state}
                  onChange={(e) => setState(e.target.value)}
                  className="w-full h-12 md:h-14 px-4 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium focus:border-black focus:bg-white outline-none cursor-pointer"
                >
                  {indianStates.map((st) => (
                    <option key={st} value={st}>
                      {st}
                    </option>
                  ))}
                </select>
              </div>

              <button
                type="submit"
                className="hidden md:flex w-full bg-black text-white h-16 rounded-xl font-bold uppercase tracking-widest text-xs items-center justify-center gap-3 hover:bg-zinc-800 transition-all shadow-lg mt-4"
              >
                Proceed to Payment <ArrowRight size={18} />
              </button>
            </form>
          </div>
        </div>
      </div>

      <div className="md:hidden fixed bottom-0 left-0 w-full bg-white border-t border-gray-100 p-4 z-50 shadow-[0_-5px_15px_rgba(0,0,0,0.05)]">
        <button
          onClick={submitHandler}
          className="w-full bg-black text-white h-14 rounded-xl font-bold uppercase tracking-widest text-xs flex items-center justify-center gap-2 active:scale-95 transition-all"
        >
          Proceed to Payment <ArrowRight size={16} />
        </button>
      </div>
    </div>
  );
}
