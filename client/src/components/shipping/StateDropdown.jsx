// src/components/shipping/StateDropdown.jsx

import React, { useState } from "react";
import { Search, ChevronDown } from "lucide-react";
import { INDIAN_STATES } from "../../utils/shippingConstants";


const StateDropdown = ({ value, onChange, autoFilled }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");

  const filteredStates = INDIAN_STATES.filter((state) =>
    state.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div className="space-y-2 relative">
      <label className="text-[10px] font-black uppercase tracking-[0.18em] text-zinc-400 block">
        State
      </label>

      <div
        onClick={() => setIsOpen(true)}
        className={`ship-input no-icon flex items-center justify-between cursor-pointer ${
          autoFilled ? "autofilled" : ""
        }`}
      >
        <span>{value || "Select State"}</span>

        <ChevronDown
          size={14}
          className={`transition-transform ${isOpen ? "rotate-180" : ""}`}
        />
      </div>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />

          <div className="absolute top-full left-0 mt-1 w-full bg-white border rounded-xl shadow-xl z-50 overflow-hidden">
            <div className="p-2 border-b">
              <div className="relative">
                <Search
                  size={13}
                  className="absolute left-3 top-1/2 -translate-y-1/2"
                />

                <input
                  type="text"
                  autoFocus
                  placeholder="Search state..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full h-9 pl-9 pr-3 border rounded-lg"
                />
              </div>
            </div>

            <div className="max-h-48 overflow-y-auto">
              {filteredStates.map((state) => (
                <div
                  key={state}
                  onClick={() => {
                    onChange(state);
                    setIsOpen(false);
                    setSearch("");
                  }}
                  className={`dropdown-item ${value === state ? "active" : ""}`}
                >
                  {state}
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default StateDropdown;
