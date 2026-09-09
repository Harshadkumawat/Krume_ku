// src/components/shipping/AddressCard.jsx

import React from "react";
import { Home, Briefcase, CheckCircle2, Edit2 } from "lucide-react";

const AddressCard = ({ address, selected, onSelect, onEdit }) => {
  return (
    <div
      role="radio"
      aria-checked={selected}
      tabIndex={0}
      onClick={onSelect}
      onKeyDown={(e) => e.key === "Enter" && onSelect()}
      className={`addr-card ${selected ? "selected" : ""}`}
    >
      <button type="button" onClick={onEdit} className="edit-pill">
        <Edit2 size={10} />
        Edit
      </button>

      <div className="flex items-center gap-2.5 mb-3">
        <span
          className={`addr-type-badge ${selected ? "selected" : "default"}`}
        >
          {address.addressType === "Home" ? (
            <Home size={11} />
          ) : (
            <Briefcase size={11} />
          )}

          {address.addressType}
        </span>

        {selected && (
          <span className="ml-auto flex items-center gap-1 text-[10px] font-black text-black uppercase tracking-widest">
            <CheckCircle2 size={15} />
            Selected
          </span>
        )}
      </div>

      <p className="text-[14px] font-black uppercase tracking-tight mb-0.5">
        {address.fullName}
      </p>

      <p className="text-[12px] font-semibold text-zinc-500 mb-2">
        +91 {address.phone}
      </p>

      <p className="text-[12px] text-zinc-600 leading-relaxed">
        {address.address}
        {address.landmark && <> , near {address.landmark}</>}
      </p>

      <p className="text-[12px] font-black text-zinc-800 mt-1 uppercase">
        {address.city}, {address.state} — {address.pincode}
      </p>
    </div>
  );
};

export default AddressCard;
